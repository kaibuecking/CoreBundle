# Fork Delta Matrix

## Method and Limitation

The deployed fork is `packages/forum` at `490a475baacc4610e10d3e77daa96acf182b50ca` (`origin/customfeaturesV2`). Its `main` is `ba8013ce07a30b5195286442fc3ab461877a9832`; the merge base of `main` and `customfeaturesV2` is `9a61ac2488356207310d38d2fc520ef32a60c7f1`. There are exactly **11** non-merge commits reachable from `customfeaturesV2` but not from `main`.

The Core fork is `packages/core` at `bf42aa097419568b3eedeb658616a74c6a7a7194` (`origin/customfeaturesV2`); it has **3** non-merge commits not reachable from `main`.

**Upstream `v5.0.6` was not available in the workspace during this analysis.** The Forum repository's local tags end at `v3.10.7`, the configured remote is the fork (`kaibuecking/forumbundle`), and no `v5.0.6` tree exists under the application's absent `contao/vendor/`. No GitHub/network access was permitted. Therefore no commit is marked `upstreamed`; likely candidates are explicitly marked “retain, verify upstream”. This is a recorded blocker, not a silent assumption.

Classification vocabulary: `retain`, `upstreamed`, `obsolete`, `relocate`. A commit receives one primary class; mixed commits list per-hunk targets.

## Forum Fork: 11 Custom Commits (chronological)

| # | Commit | Date | Subject | Observable behavior | Class | Target |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `f342b92` | 2022-09-27 | Update composer.json | Changes `con4gis/core` to `kaibuecking/core` | `obsolete` | Drop in favor of upstream requirements plus application-level pinning |
| 2 | `36954ac` | 2022-09-27 | test commit | Adds empty `testfile` | `obsolete` | Drop |
| 3 | `d0fa1a9` | 2022-10-10 | add custom changes | Mixed: ticket title, custom PN actions/auth, language labels, PN notification suppression, first-post UX, template/CSS | `retain` (split) | #3 logic; #4 presentation/data |
| 4 | `8c1e000` | 2023-04-09 | fix: ignore unreferenced subscriptions | Skips subscriptions whose `tl_member` row is missing | `retain` | #3 |
| 5 | `2a5324c` | 2024-11-14 | fix: php8 errors | Returns `null` when avatar deserialize is empty/non-array | `retain` (verify upstream) | #3 |
| 6 | `d3a1f61` | 2024-11-30 | feat: always show the first post at the top | UNION query returns first post separately, then subsequent posts | `retain` | #3 |
| 7 | `1aae5f3` | 2024-11-30 | Update C4GForumHelper.php | Adds `first`/`follow` discriminator and ordering | `retain` | #3 |
| 8 | `0359a37` | 2024-11-30 | fix | Fixes SQL concatenation around `WHERE`/`UNION ALL` | `retain` | #3 |
| 9 | `7e9c9cc` | 2024-11-30 | fix | Applies correct binding for thread vs single-post case | `retain` | #3 |
| 10 | `a90040d` | 2024-11-30 | fix | Uses `a.pid` for single-post branch and `ORDER BY 1, id` | `retain` | #3 |
| 11 | `490a475` | 2025-01-13 | fix: php8 performance issue | Array initialization, member null guards, `isset($_GET['historyreq'])`, forum tree default, `DELETED_USER` key change | `retain` (split; key change must be corrected) | #3 + #4 |

### Per-Hunk Split of `d0fa1a9` (“add custom changes”)

| Hunk | Behavior | Class | Target / note |
| --- | --- | --- | --- |
| `composer.json` | `con4gis/core` → `kaibuecking/core` | `obsolete` | Drop; upstream dependency + app pinning |
| `C4GForumHelper::getTicketTitle()` | Removes type/id prefix and ticket state; title is just thread name (plus optional time) | `retain` | #3; confirm DISCUSSIONS behavior |
| `ForumController::__construct` | `$framework->initialize(true)` | `retain` | #3; re-check against 5.x framework boot |
| `ForumController::personalMessageAction` auth | Requires `FE_USER_LOGGED_IN` and `$_COOKIE['FE_USER_AUTH']` | `retain` | #3; legacy constants must be adapted |
| `ForumController::personalMessageAction` send | Forces subject `Nachricht`, returns decoded message | `retain` | #3; privateChat depends on it |
| New PN actions | `markAll`, `messages`, `contact`; helpers `getMessages`, `getContactbyId`, `getContactbyUsername`, `getMessageCount`, `markAllMessages` | `retain` | #3; used by `privateChat.js` and `mod_login.html5` |
| `C4gForumPn::send()` | Comments out `notifyRecipient()` | `retain` | #3; changes email behavior; verify single NC path |
| Language labels | “Kommentieren”, “Thementitel bearbeiten”, “Speichern”, NBSP spacing, comment header, hide subject in delete warning, PN compose icon | `relocate` | #4 application language overrides |
| `C4GForum` first-post logic | Global `$GLOBALS['first_post']`; hides first-post delete button; subtracts one from header count; Bootstrap button markup | `retain` | #3; global state is brittle, port carefully |
| `forum_user_data.html5` partial | Profile/avatar links, default avatar, hidden post-count element | `relocate` | #4; application already overrides this template |
| `c4gForum.css` | Layout/typography and SensIQue extension styles | `relocate` | #4; application already owns `contao/files/forum/css/forum.css` |

### Per-Hunk Split of `490a475` (“fix: php8 performance issue”)

| Hunk | Class | Target / note |
| --- | --- | --- |
| `C4GForumHelper` array initialization | `retain` | #3 |
| `C4GForum` null-safe `$oMember`, member links, signature, forum tree, history query | `retain` | #3 |
| `C4gForumMember::getAvatarByMemberId()` null path guard | `retain` | #3 |
| `frontendModules.php` `DELETED_USER` key changed from `DISCUSSION` to `DISCUSSIONS` | `obsolete` / correct during port | This currently mismatches app templates that read `DISCUSSION`; do not preserve the typo |

## Core Fork: 3 Custom Commits

| # | Commit | Date | Subject | Observable behavior | Class | Target |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `e734e471` | 2022-09-27 | Update composer.json | Renames package `con4gis/core` → `kaibuecking/core` | `obsolete` | Drop; consolidate on one core package |
| 2 | `634ba637` | 2022-09-27 | Sensique modifications | Adds close icon in `DialogHandler.js`; hardcodes `imgUpload.php` upload path to `/files/uploads/images/`, changes relative initialize path, returns only URL, suppresses script output | `relocate` | #4 application asset/upload ownership; drop if editor no longer uses legacy uploader |
| 3 | `bf42aa09` | 2024-12-15 | fix: php8 errors | Guards `C4GVersionProvider` against missing `packages[package]` | `retain` (verify upstream) | #3/#4; keep only if relevant after 5.x core alignment |

## Upstream `v5.0.6` Delta Status

| Question | Status | Evidence |
| --- | --- | --- |
| Is `v5.0.6` present locally? | No | Local tags stop at `v3.10.7`; `git tag -l 'v4*' 'v5*'` is empty |
| Is upstream configured as a remote? | No | Only `origin` fork remotes exist |
| Is upstream available in Composer vendor? | No | `contao/vendor/` is not present in the workspace |
| Can the upstream side be enumerated here? | No | Analysis mandate forbids GitHub/network access |
| Which changes are already upstream? | Unknown | Must be verified against the actual tag |
| Which changes are likely upstream candidates? | `2a5324c`, `490a475` null guards, `bf42aa09` | PHP 8 compatibility fixes often land upstream; not proven |

Required authorized procedure for the follow-up:

1. In an environment allowed to access upstream, fetch the upstream Forum repository and tag `v5.0.6`; do not modify the deployed submodule pointer.
2. Record the resolved tag object and compare it to `490a475`.
3. Identify the common ancestor and list both sides:
   - `git merge-base <upstream-v5.0.6> 490a475`
   - `git log --oneline --no-merges <common-ancestor>..490a475`
   - `git log --oneline --no-merges 490a475..<upstream-v5.0.6>`
4. For each custom commit, search the upstream tree for equivalent logic (`git log -S`, `git grep`, or manual diff of the touched functions).
5. Update the `Class` column only with evidence; move `retain (verify upstream)` to `upstreamed` only when the upstream code demonstrably contains equivalent behavior.
6. Run the same procedure for the Core fork against the `con4gis/core` version required by `v5.0.6` (the lock currently shows `con4gis/core` v7.1.7 in addition to the `kaibuecking/core` fork).

## Prior Branch Observation

`origin/customfeaturesV3` is a later, non-deployed branch: `main` + 5 commits, with a claimed attempt to move language/template/CSS overrides to project level. Its `e3b5c40` commit message describes that split but the commit itself only changes `.idea` files; the actual language/template/CSS changes are still in the branch. Treat `customfeaturesV3` as evidence of intent, not as a validated upstream port or a source of truth.

## Classification Summary

| Class | Forum commits | Core commits |
| --- | --- | --- |
| `retain` | 9 (including 2 with mixed hunks) | 1 |
| `relocate` | 0 as primary (present inside `d0fa1a9`) | 1 |
| `obsolete` | 2 | 1 |
| `upstreamed` (verified) | 0 | 0 |
| `upstreamed` candidates awaiting evidence | `2a5324c`, `490a475` | `bf42aa09` |
