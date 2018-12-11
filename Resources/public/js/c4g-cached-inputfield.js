/**
 * This class generates an input field, which caches inputs into the browser's storage and suggests them, when they
 * match future inputs. Requires jQuery.
 */
class CachedInputfield {

  /**
   * Constructor.
   * @param cssDiv          The div that shall contain the cachable input element.
   * @param inputClass      The class(es) that the input field should have.
   * @param defaultSaving   If true, the storing of input values will be bound to the change event of the input field.
   *                        This value can be set to false if you wish to take care of the input storing yourself.
   *                        This is recommended, as you have more control over when things get stored. You can add a
   *                        value to the suggestions and store it into the browser by calling the "storeValue" method.
   * @param opt_cacheKey    If set, this will be used as cache key for the suggestions of this field.
   */
  constructor(cssDiv, inputClass, defaultSaving, opt_cacheKey) {
    this.container = $(cssDiv);
    $(this.container).addClass("c4g-cached-input");
    this.cacheKey = opt_cacheKey || cssDiv;
    if (!this.container) {
      console.warn("The given CSS selector matches no DOM element...");
      return;
    }
    this.inputField = document.createElement("input");
    $(this.inputField).addClass(inputClass);
    this.container.append(this.inputField);
    this.suggestions = [];
    this.suggestionList = document.createElement("ul");
    let offset = $(this.inputField).offset();
    this.suggestionList.style.left = offset.left + "px";
    // the -2 is needed to have equal widths of the input field and the list
    this.suggestionList.style.width = (parseInt(this.inputField.offsetWidth, 10) - 2) + "px";
    this.suggestionList.style.display = "none";
    this.container.append(this.suggestionList);
    this.init(defaultSaving);
  }

  /**
   * Executes the initial setup like loading cached values and setting up listeners.
   */
  init(defaultSaving) {
    const scope = this;
    this.loadValues();
    // set change listener for caching inputs
    if (defaultSaving) {
      $(this.inputField).on('change', function() {
        scope.storeValue($(this).val());
      });
    }
    // set input listener for checking inputs
    $(this.inputField).on('input', function () {
      // if ($(this).val().length >= 3) {
        scope.checkInput($(this).val());
      // }
    });

  }

  /**
   * Returns the cache key for this input field. Currently the CSS selector of the div is used.
   * @returns {*}
   */
  getCacheKey() {
    return this.cacheKey;
  }

  /**
   * Adds a value to this.suggestions and updates the value stored in the browser.
   */
  storeValue(value) {
    if (value && !this.suggestions.includes(value)) {
      this.suggestions.push(value);
      this.serializeValues();
    }
  }

  /**
   * Writes the current suggestions into the browser storage.
   */
  serializeValues() {
    window.localStorage.setItem(this.getCacheKey(), JSON.stringify(this.suggestions));
  }

  /**
   * Loads the values from the browser storage.
   */
  loadValues() {
    const localStorage = window.localStorage;
    let tmpResult = localStorage.getItem(this.getCacheKey());
    if (tmpResult) {
      // only assign when a defined value was loaded
      // the loaded value is encoded json
      this.suggestions = JSON.parse(tmpResult);
    } else {
      this.suggestions = [];
    }
  }

  /**
   * Checks if the given current input value matches any of the cached inputs. If yes, it shows the suggestion list.
   * @param currentInput
   */
  checkInput(currentInput) {
    let matchingValues = [];
    for (let i = 0; i < this.suggestions.length; i++) {
      if (this.suggestions[i].startsWith(currentInput)) {
        matchingValues.push(this.suggestions[i]);
      }
    }
    this.showSuggestions(matchingValues);
  }

  /**
   * Builds the suggestion list from the passed suggestions.
   */
  createSuggestions(suggestions) {
    const scope = this;
    $(this.suggestionList).empty();
    let currentValue = null;
    let currentItem = null;
    let textElem = null;
    let rmButton = null;
    for (let i = 0; i < suggestions.length; i++) {
      currentValue = suggestions[i];
      currentItem = document.createElement("li");
      $(currentItem).addClass("suggestion-list-item");
      textElem = document.createElement("span");
      textElem.innerText = currentValue;
      currentItem.appendChild(textElem);
      $(currentItem).on('click', function() {
        scope.selectSuggestion(this.childNodes[0]);
      });
      rmButton = document.createElement("button");
      rmButton.innerText = "X";
      $(rmButton).on('click', function(event) {
        scope.removeSuggestion(this.previousSibling.innerText);
        event.stopPropagation();
        scope.checkInput($(scope.inputField).val());
        scope.hideSuggestions();
      });
      $(rmButton).addClass("remove-suggestion-btn");
      currentItem.appendChild(rmButton);
      this.suggestionList.appendChild(currentItem);
    }
  }

  /**
   * Searches the given suggestion in this.suggestions and removes it if it's found.
   * @param suggestion
   */
  removeSuggestion(suggestion) {
    for (let i = 0; i < this.suggestions.length; i++) {
      if (this.suggestions[i] === suggestion) {
        this.suggestions.splice(i, 1);
        this.serializeValues();
      }
    }
  }

  /**
   * Displays an unordered list below the input field, containing all the matching suggestions.
   */
  showSuggestions(suggestions) {
    const scope = this;
    // TODO man sollte auch mit den richtungstasten durch die optionen navigieren können
    this.createSuggestions(suggestions);
    // only show list when it has entries
    if (suggestions.length > 0) {
      this.suggestionList.style.display = "";
      this.setupListNavigation(suggestions);
    } else {
      this.hideSuggestions();
    }
  }

  setupListNavigation(options) {
    const scope = this;
    // we index the options here from 1 to n, so 0 means no selection
    let selectedOption = 0;
    // a direction of -1 means we go up, 1 means down
    let direction = 0;
    let select = false;
    $(this.inputField).on('keydown', function(event) {
      if (event.keyCode === 38) {
        // keystroke up
        direction = -1;
      } else if (event.keyCode === 40) {
        // keystroke down
        direction = 1;
      } else {
        // no arrow key
        if (event.keyCode === 13) {
          // keystroke "enter/return"
          direction = 0;
          select = true;
        } else {
          return;
        }
      }
      selectedOption += direction;
      // check if there is an option with the desired index
      if (options[selectedOption - 1]) {
        // highlight option
        console.log("highlighted option is: " + options[selectedOption - 1]);
        scope.highlightOption(options[selectedOption - 1], select);
      } else {
        // there is no option
        // overflow index
        selectedOption = (selectedOption > options.length) ? selectedOption - options.length : options.length;
        scope.highlightOption(options[selectedOption - 1]);
      }
    });
    // TODO mouseover muss auch einträge highlighten
    // TODO mouseclick wählt bereits aus, enter soll den aktuellen bestätigen
  }

  detachListNavigation() {
    $(this.inputField).off('keydown');
  }

  highlightOption(optionText, select) {
    let childs = this.suggestionList.childNodes;
    for (let i = 0; i < childs.length; i++) {
      if (childs[i].firstChild.innerText === optionText) {
        if (select) {
          this.selectSuggestion(childs[i].firstChild);
        } else {
          // TODO nicht hart setzen hier!
          childs[i].style.backgroundColor = "rebeccapurple";
        }
      } else {
        childs[i].style.backgroundColor = "";
      }
    }
  }

  /**
   * Hides the suggestion list.
   */
  hideSuggestions() {
    this.suggestionList.style.display = "none";
  }

  /**
   * Selects a suggestion and applies it onto the input field.
   */
  selectSuggestion(listItem) {
    $(this.inputField).val(listItem.innerText);
    this.hideSuggestions();
    this.detachListNavigation();
  }

}