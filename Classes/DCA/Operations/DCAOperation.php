<?php

namespace con4gis\CoreBundle\Classes\DCA\Operations;

use con4gis\CoreBundle\Classes\DCA\DCA;

class DCAOperation
{
    protected $name;
    protected $global;

    public function __construct(DCA $dca, string $name)
    {
        $this->name = $name;
        $GLOBALS[DCA::TL_DCA][$dca->getName()][DCA::LIST][DCA::OPERATIONS][$name] = [];
        $this->global = &$GLOBALS[DCA::TL_DCA][$dca->getName()][DCA::LIST][DCA::OPERATIONS][$name];
        $dca->list()->addOperation($this);
    }

    public function getName() : string
    {
        return $this->name;
    }

    public function label(string $dcaName, string $operationName)
    {
        $this->global['label'] = $GLOBALS['TL_LANG'][$dcaName][$operationName];
    }

    public function href(string $href)
    {
        $this->global['href'] = $href;
    }

    public function icon(string $icon)
    {
        $this->global['icon'] = $icon;
    }

    public function attributes(string $attributes)
    {
        $this->global['attributes'] = $attributes;
    }

    public function buttonCallback(string $class, string $method)
    {
        $this->global['button_callback'] = [$class, $method];
    }
}
