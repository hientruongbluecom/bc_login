<?php
class Bc_Login_Model_Ajaxlogin extends Bc_Login_Model_Validator
{
    /**
     * Init.
     */
    public function _construct()
    {
        parent::_construct();

        $this->setEmail($_POST['email']);
        $this->setSinglePassword($_POST['password']);

        // Start login process.
        if ($this->_result == '') {
            $this->_loginUser();
        }
    }

    /**
     * Try login user.
     */
    protected function _loginUser() {
        $session = Mage::getSingleton('customer/session');

        try {
            $session->login($this->_userEmail, $this->_userPassword);
            $customer = $session->getCustomer();

            $session->setCustomerAsLoggedIn($customer);

            $this->_result .= 'success';
        } catch(Exception $ex) {
            $this->_result .= 'wronglogin,';
        }
    }

    /**
     * String result for Javascript.
     * @return string
     */
    public function getResult()
    {
        return $this->_result;
    }
}