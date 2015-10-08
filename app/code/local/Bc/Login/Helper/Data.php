<?php
class Bc_Login_Helper_Data extends Mage_Core_Helper_Abstract{
    //check module is enable
    public function isEnable(){
        return Mage::getStoreConfig('bcajaxlogin/settings/enabled');
    }
}