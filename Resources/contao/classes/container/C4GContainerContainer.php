<?php
/**
 * con4gis - the gis-kit
 *
 * @version   php 7
 * @package   con4gis
 * @author    con4gis contributors (see "authors.txt")
 * @license   GNU/LGPL http://opensource.org/licenses/lgpl-3.0.html
 * @copyright Küstenschmiede GmbH Software & Design 2011 - 2018
 * @link      https://www.kuestenschmiede.de
 */

namespace con4gis\CoreBundle\Resources\contao\classes\container;


class C4GContainerContainer extends C4GBaseContainer
{
    public function addContainer(C4GContainer $container) {
        return $this->add($container);
    }

    public function deleteContainer($key) {
        return $this->delete($key);
    }

    public function addContainersFromArray(array $array) {
        foreach ($array as $key => $value) {
            $container = new C4GContainer();
            foreach ($value as $k => $v) {
                $container->addElement($v, $k);
            }
            $this->addContainer($container);
        }
    }
}