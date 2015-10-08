<?php
if(Mage::helper('bc_login')->isEnable()){
    require_once Mage::getModuleDir('controllers', 'Mage_Customer') . DS . 'AccountController.php';
    class Bc_Login_AccountController extends Mage_Customer_AccountController
    {
        /**
         * @var string
         */
        protected $_url;

        /**
         * Before actions.
         * @return Mage_Core_Controller_Front_Action|void
         */
        public function preDispatch()
        {
            $this->_url = Mage::getBaseUrl() . '?ajaxlogin';
            parent::preDispatch();
        }
        /**
         * Disable login action.
         */
        public function loginAction()
        {
            $this->_setLocation();
        }

        /**
         * Disable create action.
         */
        public function createAction()
        {
            $this->_setLocation();
        }

        /**
         * Redirect to home.
         */
        protected function _setLocation()
        {
            Mage::app()->getFrontController()->getResponse()->setRedirect($this->_url);
        }
    }
}else{
    require_once Mage::getModuleDir('controllers', 'Mage_Customer') . DS . 'AccountController.php';
    class Bc_Login_AccountController extends Mage_Customer_AccountController
    {

    }
}