<?php

namespace con4gis\CoreBundle\Classes\DCA\Fields;

use con4gis\CoreBundle\Classes\DCA\DCA;

class TextField extends DCAField
{
    public function __construct(string $name, DCA $dca, DCAField $multiColumnField = null)
    {
        parent::__construct($name, $dca, $multiColumnField);
        $this->default('')
            ->inputType('text')
            ->sql("varchar(255) NOT NULL default ''")
            ->eval()->maxlength(255);
    }
}
