<?php

namespace con4gis\CoreBundle\Classes\DCA;

class DCAListSorting
{
    protected $global;

    public function __construct(string $dcaName)
    {
        $GLOBALS[DCA::TL_DCA][$dcaName][DCA::LIST][DCA::SORTING] = [];
        $this->global = &$GLOBALS[DCA::TL_DCA][$dcaName][DCA::LIST][DCA::SORTING];
        $this->mode(2);
        $this->panelLayout('search,limit');
    }

    public function mode(int $mode)
    {
        $this->global['mode'] = $mode;

        return $this;
    }

    public function panelLayout(string $panelLayout)
    {
        $this->global['panelLayout'] = $panelLayout;

        return $this;
    }

    public function fields(array $fields)
    {
        $this->global['fields'] = $fields;

        return $this;
    }

    public function headerFields(array $headerFields)
    {
        $this->global['headerFields'] = $headerFields;

        return $this;
    }
}
