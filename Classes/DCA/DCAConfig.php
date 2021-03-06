<?php

namespace con4gis\CoreBundle\Classes\DCA;

class DCAConfig
{
    protected $global;

    public function __construct(string $dcaName)
    {
        $GLOBALS[DCA::TL_DCA][$dcaName][DCA::CONFIG] = [];
        $this->global = &$GLOBALS[DCA::TL_DCA][$dcaName][DCA::CONFIG];

        $this->label(strval($GLOBALS['TL_CONFIG']['websiteTitle']));
        $this->dataContainer('Table');
        $this->enableVersioning(true);
        $this->sqlKeys('id', 'primary');
    }

    public function label(string $label)
    {
        $this->global['label'] = $label;
    }

    public function dataContainer(string $dataContainer)
    {
        $this->global['dataContainer'] = $dataContainer;
    }

    public function enableVersioning(bool $enableVersioning)
    {
        $this->global['enableVersioning'] = $enableVersioning;
    }

    public function onloadCallback(string $class, string $method)
    {
        $this->global['onload_callback'] = [[$class, $method]];

        return $this;
    }

    public function onsubmitCallback(string $class, string $method)
    {
        $this->global['onsubmit_callback'] = [[$class, $method]];

        return $this;
    }

    public function markAsCopy(string $field)
    {
        $this->global['markAsCopy'] = $field;

        return $this;
    }

    public function sqlKeys(string $field, string $value)
    {
        $this->global['sql'] = [
            'keys' => [
                $field => $value,
            ],
        ];
    }
}
