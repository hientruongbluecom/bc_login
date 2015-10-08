<?php
class Bc_Login_AjaxController extends Mage_Core_Controller_Front_Action
{
    /**
     * Root: bclogin/index/index
     */
    public function indexAction()
    {
        if (isset($_POST['ajax'])){
            // Login request
            if ($_POST['ajax'] == 'login' && Mage::helper('customer')->isLoggedIn() != true) {
                $login = Mage::getSingleton('bc_login/ajaxlogin');
                echo $login->getResult();
                // Register request
            } else if ($_POST['ajax'] == 'register' && Mage::helper('customer')->isLoggedIn() != true) {
                $register = Mage::getSingleton('bc_login/ajaxregister');
                echo $register->getResult();
            }
        }
    }
}