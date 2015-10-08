<?php
class Bc_Login_Block_Login extends  Mage_Core_Block_Template
{
    /**
     * Retrieve string 1 if Redirection to profile is YES on system config page.
     * @return string
     */
    public function isRedirectToProfile()
    {
        if (Mage::getStoreConfig('bcajaxlogin/settings/redirection')) {
            return '1';
        }
        return '0';
    }
}