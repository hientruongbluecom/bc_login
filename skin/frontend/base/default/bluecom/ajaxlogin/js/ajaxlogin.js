(function($) {
    $.fn.bcAjaxLogin = function(options) {

        var opts = $.extend({}, $.fn.bcAjaxLogin.defaults, options);

        return start();

        /**
         * Init.
         */
        function start() {
            // Add windows from Ajaxlogin view to RWD dropdown
            replaceAjaxWindows();
            // Disable links what are linked to login or register pages
            removeOriginalJsLocations();
            // Open and close windows
            openCloseWindowEvents();
            // Ajax calls
            sendEvents();
        }

        /**
         * Add windows from Ajaxlogin view to RWD dropdown include the Loader.
         */
        function replaceAjaxWindows() {
            var loginWindow = $('.bc-login-window');
            var registerWindow = $('.bc-register-window');
            var loader = $('.bc-ajaxlogin-loader');
            $('#header-account').html(loginWindow);
            $('#header-account').append(registerWindow);
            $('#header-account').append(loader);
        }

        /**
         * Disable links what are linked to login or register pages.
         */
        function removeOriginalJsLocations() {
            $('a[href*="customer/account/create"], ' +
                'a[href*="customer/account/login"], ' +
                '.customer-account-login .new-users button')
                .attr('onclick', 'return false;');
        }

        /**
         * Open, close and switch Login and Register windows.
         */
        function openCloseWindowEvents() {
            // Login open - auto
            if (opts.autoShowUp == 'yes'
                && $('.messages').css('display') != 'block') {
                $('.skip-links .skip-account').trigger('click');
                animateShowWindow('login');
            }
            // Login open and close - click
            $('.skip-links .skip-account').on('click', function() {
                // Close
                if ($('.bc-login-window').css('display') != 'none'
                    || $('.bc-register-window').css('display') != 'none') {
                    animateCloseWindow('login', false, false);
                    // Open
                } else {
                    animateShowWindow('login');
                }
                return false;
            });
            // Open login window by back-link on customer/account/forgotpassword
            $('a[href*="customer/account/login"]').click(function() {
                $('.skip-links .skip-account').trigger('click');
            });
            // Switching between Login and Register windows
            $('.bc-switch-window').on('click', function() {
                // Close Register window and open Login window
                if ($(this).attr('id') == 'y-to-login') {
                    animateTop();
                    animateCloseWindow('register', false, false);
                    animateShowWindow('login');

                    // Open Login window and close Register window
                } else {
                    animateTop();
                    animateCloseWindow('login', false, false);
                    animateShowWindow('register');
                }
            });
            // Open register window
            $('a[href*="customer/account/create"], .new-users button')
                .on('click', function() {
                    $('.skip-links .skip-account').trigger('click');
                    animateCloseWindow('login', false, false);
                    animateShowWindow('register');
                    return false;
                });
            // Close login window by user
            $('.bc-login-window .close').click(function() {
                animateCloseWindow('login', true, true);
            });
            // Close register window by user
            $('.bc-register-window .close').click(function() {
                animateCloseWindow('register', true, true);
            });
            // Close ajax window after drop down is closed
            autoClose();
        }

        /**
         * Scroll to top of page because of small screens.
         */
        function animateTop() {
            $('html,body').animate({scrollTop : 0});
        }

        /**
         * Registration or login request by user.
         */
        function sendEvents() {
            // Click to register in Register window
            $('.bc-register-window button').on('click', function() {
                setDatas('register');
                validateDatas('register');
                if (opts.errors != ''){
                    setError(opts.errors, 'register');
                } else {
                    callAjaxControllerRegistration();
                }
                return false;
            });

            // Press enter in login window
            $(document).keypress(function(e) {
                if(e.which == 13
                    && $('.bc-login-window').css('display') == 'block') {
                    setDatas('login');
                    validateDatas('login');
                    if (opts.errors != '') {
                        setError(opts.errors, 'login');
                    }
                    else{
                        callAjaxControllerLogin();
                    }
                }
            });

            // Click on login in Login window
            $('.bc-login-window button').on('click', function() {
                setDatas('login');
                validateDatas('login');
                if (opts.errors != '') {
                    setError(opts.errors, 'login');
                } else {
                    callAjaxControllerLogin();
                }
                return false;
            });
        }

        /**
         * Display windows.
         * @param string windowName
         */
        function animateShowWindow(windowName) {
            $('.bc-' + windowName + '-window')
                .slideDown(1000, 'easeInOutCirc');
        }

        /**
         * Show or hide the Loader with effects.
         * @param string windowName
         * @param int step
         */
        function animateLoader(windowName, step) {
            // Start
            if (step == 'start') {
                $('.bc-ajaxlogin-loader').fadeIn();
                $('.bc-' + windowName + '-window')
                    .animate({opacity : '0.4'});
                // Stop
            } else {
                $('.bc-ajaxlogin-loader').fadeOut('normal', function() {
                    $('.bc-' + windowName + '-window')
                        .animate({opacity : '1'});
                });
            }
        }

        /**
         * Close windows.
         * @param string windowName
         * @param bool quickly Close without animation.
         * @param bool closeParent Close the parent drop down
         */
        function animateCloseWindow(windowName, quickly, closeParent) {
            if (opts.stop != true){
                if (quickly == true) {
                    $('.bc-' + windowName + '-window').hide();
                    $('.bc-ajaxlogin-error').hide(function() {
                        if (closeParent) {
                            $('#header-account').removeClass('skip-active');
                        }
                    });
                } else {
                    $('.bc-ajaxlogin-error').fadeOut();
                    $('.bc-' + windowName + '-window').slideUp(function() {
                        if (closeParent) {
                            $('#header-account').removeClass('skip-active');
                        }
                    });
                }
            }
        }

        /**
         * Validate user inputs.
         * @param string windowName
         */
        function validateDatas(windowName) {
            opts.errors = '';

            // Register
            if (windowName == 'register') {
                // There is no last name
                if (opts.lastname.length < 1) {
                    opts.errors = opts.errors + 'nolastname,'
                }

                // There is no first name
                if (opts.firstname.length < 1) {
                    opts.errors = opts.errors + 'nofirstname,'
                }

                // There is no email address
                if (opts.email.length < 1) {
                    opts.errors = opts.errors + 'noemail,'
                    // It is not email address
                } else if (validateEmail(opts.email) != true) {
                    opts.errors = opts.errors + 'wrongemail,'
                }

                // There is no password
                if (opts.password.length < 1) {
                    opts.errors = opts.errors + 'nopassword,'
                    // Too short password
                } else if (opts.password.length < 6) {
                    opts.errors = opts.errors + 'shortpassword,'
                    // Too long password
                } else if (opts.password.length > 16) {
                    opts.errors = opts.errors + 'longpassword,'
                    // Passwords doe not match
                } else if (opts.password != opts.passwordsecond) {
                    opts.errors = opts.errors + 'notsamepasswords,'
                }

                // Terms and condition has not been accepted
                if (opts.licence != 'ok') {
                    opts.errors = opts.errors + 'nolicence,'
                }
                // Login
            } else if (windowName == 'login') {
                // There is no email address
                if (opts.email.length < 1) {
                    opts.errors = opts.errors + 'noemail,'
                    // It is not email address
                } else if (validateEmail(opts.email) != true) {
                    opts.errors = opts.errors + 'wrongemail,'
                }

                // There is no password
                if (opts.password.length < 1) {
                    opts.errors = opts.errors + 'nopassword,'
                    // Too long password
                } else if (opts.password.length > 16) {
                    opts.errors = opts.errors + 'wronglogin,'
                }
            }
        }

        /**
         * Email validator. Retrieve TRUE if it is an email address.
         * @param string emailAddress
         * @returns {boolean}
         */
        function validateEmail(emailAddress) {
            var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

            if (filter.test(emailAddress)) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Save user input data to property for ajax call.
         * @param string windowName
         */
        function setDatas(windowName) {
            // Register window
            if (windowName == 'register') {
                opts.firstname = $('.bc-' + windowName
                    + '-window #bc-firstname').val();
                opts.lastname = $('.bc-' + windowName
                    + '-window #bc-lastname').val();

                if ($('.bc-' + windowName
                    + '-window input[name="bc-newsletter"]:checked')
                    .length > 0) {
                    opts.newsletter = 'ok';
                } else {
                    opts.newsletter = 'no';
                }

                opts.email = $('.bc-' + windowName
                    + '-window #bc-email').val();
                opts.password = $('.bc-' + windowName
                    + '-window #bc-password').val();
                opts.passwordsecond = $('.bc-' + windowName
                    + '-window #bc-passwordsecond').val();

                if ($('.bc-' + windowName
                    + '-window input[name="bc-licence"]:checked')
                    .length > 0) {
                    opts.licence = 'ok';
                } else {
                    opts.licence = 'no';
                }
                // Login window
            } else if (windowName == 'login') {
                opts.email = $('.bc-' + windowName
                    + '-window #bc-email').val();
                opts.password = $('.bc-' + windowName
                    + '-window #bc-password').val();
            }
        }

        /**
         * Load error messages into windows and show them.
         * @param string errors Comma separated.
         * @param string windowName
         */
        function setError(errors, windowName) {
            $('.bc-' + windowName + '-window .bc-ajaxlogin-error')
                .text('');
            $('.bc-' + windowName + '-window .bc-ajaxlogin-error')
                .hide();

            var errorArr = new Array();
            errorArr = errors.split(',');

            var length = errorArr.length - 1;

            for (var i = 0; i < length; i++) {
                var errorText = $('.ytmpa-' + errorArr[i]).text();

                $('.bc-' + windowName + '-window .err-' + errorArr[i])
                    .text(errorText);
            }

            $('.bc-' + windowName + '-window .bc-ajaxlogin-error')
                .fadeIn();
        }

        /**
         * Ajax call for registration.
         */
        function callAjaxControllerRegistration() {
            // If there is no another ajax calling
            if (opts.stop != true) {

                opts.stop = true;

                // Load the Loader
                animateLoader('register', 'start');

                // Send data
                var ajaxRegistration = jQuery.ajax({
                    url: opts.controllerUrl,
                    type: 'POST',
                    data: {
                        ajax : 'register',
                        firstname : opts.firstname,
                        lastname : opts.lastname,
                        newsletter : opts.newsletter,
                        email : opts.email,
                        password : opts.password,
                        passwordsecond : opts.passwordsecond,
                        licence : opts.licence
                    },
                    dataType: "html"
                });
                // Get data
                ajaxRegistration.done(function(msg) {
                    // If there is error
                    if (msg != 'success') {
                        setError(msg, 'register');
                        // If everything are OK
                    } else {
                        opts.stop = false;
                        animateCloseWindow('register', false, true);
                        // Redirect
                        if (opts.redirection == '1') {
                            window.location = opts.profileUrl;
                        } else {
                            window.location.reload();
                        }
                    }
                    animateLoader('register', 'stop');
                    opts.stop = false;
                });
                // Error on ajax call
                ajaxRegistration.fail(function(jqXHR, textStatus, errorThrown) {
                    opts.stop = false;
                    animateLoader('register', 'stop');
                });
            }
        }

        /**
         * Ajax call for login.
         */
        function callAjaxControllerLogin() {
            // If there is no another ajax calling
            if (opts.stop != true){

                opts.stop = true;

                // Load the Loader
                animateLoader('login', 'start');

                // Send data
                var ajaxRegistration = jQuery.ajax({
                    url: opts.controllerUrl,
                    type: 'POST',
                    data: {
                        ajax : 'login',
                        email : opts.email,
                        password : opts.password
                    },
                    dataType: "html"
                });
                // Get data
                ajaxRegistration.done(function(msg) {
                    // If there is error
                    if (msg != 'success'){
                        setError(msg, 'login');
                        // If everything are OK
                    } else {
                        opts.stop = false;
                        animateCloseWindow('login', false, true);
                        // Redirect
                        if (opts.redirection == '1') {
                            window.location = opts.profileUrl;
                        } else {
                            window.location.reload();
                        }
                    }
                    animateLoader('login', 'stop');
                    opts.stop = false;
                });
                // Error on ajax call
                ajaxRegistration.fail(function(jqXHR, textStatus, errorThrown) {
                    opts.stop = false;
                    animateLoader('login', 'stop');
                });
            }
        }

        /**
         * Close windows if media CSS are changing by resize or menu is closing.
         */
        function autoClose() {
            closeInClose();

            // On resize event
            $(window).resize(function() {
                closeInClose();
            });

            // On click another menu item event
            $('.skip-links a').click(function() {
                closeInClose();
            });
        }

        /**
         * Close windows if menu is not open.
         */
        function closeInClose() {
            if ($('.page-header-container #header-account')
                .hasClass('skip-active') != true) {
                animateCloseWindow('login', true, false);
                animateCloseWindow('register', true, false);
            }
        }
    };

    /**
     * Property list.
     * @type {{
     *      redirection: string,
     *      windowSize: string,
     *      stop: boolean,
     *      controllerUrl: string,
     *      profileUrl: string,
     *      autoShowUp: string,
     *      errors: string,
     *      firstname: string,
     *      lastname: string,
     *      newsletter: string,
     *      email: string,
     *      password: string,
     *      passwordsecond: string,
     *      licence: string
     * }}
     */
    $.fn.bcAjaxLogin.defaults = {
        redirection : '0',
        windowSize : '',
        stop : false,
        controllerUrl : '',
        profileUrl : '',
        autoShowUp : '',
        errors : '',
        firstname : '',
        lastname : '',
        newsletter : 'no',
        email : '',
        password : '',
        passwordsecond : '',
        licence : 'no'
    };

})(jQuery);