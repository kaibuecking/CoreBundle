<?php
/**
 * @package     esitlib
 * @version     1.0.0
 */
namespace con4gis\CoreBundle\Classes\Helper;

/**
 * Class AutoloadHelper
 * @package con4gis\CoreBundle\Classes\Helper
 */
class AutoloadHelper
{
    /**
     * Ruft das Laden der Templates (*.html5, *.xhtml und *.html) für den
     * übergebenen Pfad (inkl. Unterordnern) auf.
     * @param        $strPath
     * @param string $strRgex
     */
    public static function loadTemplates($strPath, $strRgex = '/^.+\.[x]*html[5]*$/i')
    {
        $folder = (substr_count($strPath, 'system/modules')) ? '/templates' : '/Resources/contao/templates';
        $strPath = self::makePath($strPath, $folder);
        $objFiles = self::getFiles($strPath, $strRgex);

        if ($objFiles) {
            self::registerTemplates($objFiles);
        }
    }

    /**
     * Registriert die gefundenen Templates bei Contao.
     * @param $objFiles
     */
    protected static function registerTemplates($objFiles)
    {
        foreach ($objFiles as $varFile) {
            $strFile = (is_array($varFile)) ? array_shift($varFile) : $varFile;
            $objFile = pathinfo($strFile);
            \TemplateLoader::addFile($objFile['filename'], str_replace(TL_ROOT . '/', '', $objFile['dirname']));
        }
    }

    /**
     * Prüft den übergebenen Pfad und ergänzt die fehlenden Bestandteile.
     * @param $strPath
     * @param $folder
     * @return mixed|string
     */
    protected static function makePath($strPath, $folder)
    {
        $strPath = (!substr_count($strPath, TL_ROOT)) ? TL_ROOT . '/' . $strPath : $strPath;
        $strPath .= "$folder/";
        $strPath = str_replace('//', '/', $strPath);

        return $strPath;
    }

    /**
     * Sucht die Templates im übergebenen Pfad.
     * @param        $strPath
     * @param string $strRgex
     * @return null|\RegexIterator
     */
    protected static function getFiles($strPath, $strRgex = '/^.+\.php$/i')
    {
        if (is_dir($strPath)) {
            $objDirectory = new \RecursiveDirectoryIterator($strPath, \FilesystemIterator::SKIP_DOTS);
            $objIterator = new \RecursiveIteratorIterator($objDirectory);
            $objFiles = new \RegexIterator($objIterator, $strRgex, \RecursiveRegexIterator::GET_MATCH);

            return $objFiles;
        }

        return null;
    }
}
