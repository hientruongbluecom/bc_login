;
var BC = BC || {};
BC.Login = {
    window : '',
    close:'',
    content:'',
    config:null,
    init:function(config){
        BC.Login.config = jQuery.extend({
            triggers: config,
            markup:
                '<div class="d-shadow-wrap">'
                    +   '<div class="content"></div>'
                    +   '<div class="d-sh-cn d-sh-tl"></div><div class="d-sh-cn d-sh-tr"></div>'
                    + '</div>'
                    + '<div class="d-sh-cn d-sh-bl"></div><div class="d-sh-cn d-sh-br"></div>'
                    + '<a href="javascript:void(0)" class="close"></a>'
        },config||{});
        BC.Login.config.size = jQuery.extend(true,{
            width    : 'auto',
            height   : 'auto',
            maxWidth : 550,
            maxHeight: 600
        },BC.Login.config.size || {});
        this._prepareMarkup();
        this._attachEventListeners();
        this._addEventListeners();
    },
    update: function(content, size) {
        var oldContent = jQuery(BC.Login.content).children();
        oldContent && jQuery('body').append(oldContent.hide());

        jQuery(BC.Login.content).html(content);
        content.show();
        BC.Login.updateSize(size);
        BC.Login.center();
        return this;
    },
    updateSize: function(sizeConfig) {
        sizeConfig = sizeConfig || BC.Login.config.size;
        // reset previous size
        jQuery(BC.Login.window).css({
            width : 'auto',
            height: 'auto',
            left  : 0, /* thin content box fix while page is scrolled to the right */
            top   : 0
        });
        jQuery(BC.Login.content).css({
            width : isNaN(sizeConfig.width)  ? sizeConfig.width  : sizeConfig.width + 'px',
            height: isNaN(sizeConfig.height) ? sizeConfig.height : sizeConfig.height + 'px'
        });

        jQuery(BC.Login.window).css({
            visibility: 'hidden'
        }).show();

        var width        = jQuery(BC.Login.content).width() + 100, /* right shadow and borders */
            viewportWidth = jQuery(document).width(),
            viewportHeight = jQuery(document).height();

        sizeConfig = jQuery.extend(BC.Login.config.size, sizeConfig || {});
        if ('auto' === sizeConfig.width
            && (width > sizeConfig.maxWidth || width > viewportWidth)) {

            if (width > viewportWidth && viewportWidth < (sizeConfig.maxWidth + 100)) {
                width = viewportWidth - 100; /* right shadow and borders */
            } else {
                width = sizeConfig.maxWidth;
            }
            jQuery(BC.Login.content).css({
                width: width + 'px'
            });
        }

        var height          = jQuery(BC.Login.content).height() + 20 /* top button */;
        if ('auto' === sizeConfig.height
            && (height > sizeConfig.maxHeight || height > viewportHeight)) {

            if (height > viewportHeight && viewportHeight < (sizeConfig.maxHeight + 20)) {
                height = viewportHeight - 60; /* bottom shadow */
            } else {
                height = sizeConfig.maxHeight;
            }
            jQuery(BC.Login.content).css({
                height: height + 'px'
            });
        }

        // update window size. Fix for all IE browsers
        var paddingHorizontal = parseInt(jQuery(BC.Login.content).css('padding-left')) + parseInt(jQuery(BC.Login.content).css('padding-right'));
        jQuery(BC.Login.window).hide();
        jQuery(BC.Login.window).css({
                width     : width + paddingHorizontal + 'px',
                visibility: 'visible'
            });

        return this;
    },
    show: function() {
        if (!this.centered) {
            this.center();
        }
        if(jQuery("#header-account").hasClass("skip-active")){
            jQuery("#header-account").removeClass("skip-active");
        }
        if(jQuery('body').find('.messages')){
            jQuery('body').find('.messages').remove();
        }
        jQuery('.select').addClass('ajaxlogin-hidden');

        if (!jQuery('body').find('#ajaxlogin-mask').length){
            var mask = jQuery("<div id='ajaxlogin-mask'></div>").appendTo('body');
            var body    = jQuery('body'),
                element = jQuery('html'),
                height  = Math.max(
                    Math.max(body.outerHeight(), element.outerHeight()),
                    Math.max(body.height(), element.height())
                );
            mask.css({
                height: height + 'px'
            });
        }

        // set highest z-index
        var zIndex = 999;
        jQuery('.ajaxlogin-window').each(function(i) {
            maxIndex = parseInt(jQuery(this).css('zIndex'));
            if (zIndex < maxIndex) {
                zIndex = maxIndex;
            }
        });
        jQuery(BC.Login.window).css({
            zIndex: zIndex + 1
        });


        jQuery(BC.Login.window).show();
    },
    _prepareMarkup: function() {
        BC.Login.window = jQuery('<div></div>').addClass("ajaxlogin-window")[0];
        jQuery(BC.Login.window).append(BC.Login.config.markup).hide();
        BC.Login.content = jQuery(BC.Login.window).find('.content')[0];
        BC.Login.close   = jQuery(BC.Login.window).find('.close')[0];
        jQuery('body').append(BC.Login.window);
    },
    _attachEventListeners: function(){
        jQuery(BC.Login.close).bind('click',function (){
            BC.Login.hide();
        });
        if (BC.Login.config.triggers) {
            for (var i in BC.Login.config.triggers) {
                var trigger = BC.Login.config.triggers[i];
                if (typeof trigger === 'function') {
                    continue;
                }
                trigger.size = trigger.size || {};
                for (var j in BC.Login.config.size) {
                    if (trigger.size[j]) {
                        continue;
                    }
                    trigger.size[j] = BC.Login.config.size[j];
                }
                trigger.el.each(function(index){
                    var t = trigger;
                    jQuery(this).bind(t.event,function(e) {
                        if (typeof e != 'undefined') { // ie9 fix
                            e.preventDefault ? e.preventDefault() : e.returnValue = false;
                        }
                        e.stopPropagation();
                        if (!t.window) {
                            return;
                        }
                        BC.Login.update(t.window[0], t.size).show();
                    });
                });
            }
        }
    },
    _addEventListeners: function() {
        var self = this;

        jQuery('#ajaxlogin-login-form') && jQuery('#ajaxlogin-login-form').bind('submit', function(e) {
            if (typeof e != 'undefined') { // ie9 fix
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
            e.stopPropagation();

            if (!ajaxLoginForm.validator.validate()) {
                return false;
            }

            jQuery('#login-please-wait').show();
            jQuery('#send2').attr('disabled', 'disabled');
            jQuery('#ajaxlogin-login-form .buttons-set')
                .addClass('disabled')
                .css('opacity','0.5');
            jQuery.ajax({
                type: 'POST',
                url: jQuery('#ajaxlogin-login-form').attr("action"),
                data: jQuery('#ajaxlogin-login-form').serialize(),
                success: function(transport){
                    jQuery('#ajaxlogin-login-window').find('.messages').remove();
                    var response = jQuery.parseJSON(transport);
                    if (response.error) {
                        jQuery('<ul class="messages"></ul>').insertBefore('form#ajaxlogin-login-form');
                        jQuery('.messages').append('<li class="error-msg"><ul>'+response.error+'</ul></li>');
                    }
                    if (response.redirect) {
                        window.location.href = response.redirect;
                        return;
                    }
                    jQuery('#login-please-wait').hide();
                    jQuery('#send2').removeAttr('disabled');
                    jQuery('#ajaxlogin-login-form .buttons-set')
                        .removeClass('disabled')
                        .css('opacity','1');
                }

            });

        });

        jQuery('#ajaxlogin-create-form') && jQuery('#ajaxlogin-create-form').bind('submit', function(e) {
            if (typeof e != 'undefined') { // ie9 fix
                e.preventDefault ? event.preventDefault() : e.returnValue = false;
            }
            e.stopPropagation();

            if (!ajaxLoginForm.validator.validate()) {
                return false;
            }

            jQuery('#create-please-wait').show();
            jQuery('#create').attr('disabled', 'disabled');
            jQuery('#ajaxlogin-create-form .buttons-set')
                .addClass('disabled')
                .css('opacity','0.5');
            jQuery.ajax({
                type:'POST',
                url: jQuery('#ajaxlogin-create-form').attr("action"),
                data:jQuery('#ajaxlogin-create-form').serialize(),
                success: function (transport){
                    jQuery('#ajaxlogin-create-window').find('.messages').remove();
                    var response = jQuery.parseJSON(transport);
                    if (response.error) {
                        jQuery('<ul class="messages"></ul>').insertBefore('form#ajaxlogin-create-form');
                        jQuery('.messages').append('<li class="error-msg"><ul>'+response.error+'</ul></li>');
                    }
                    if (response.redirect) {
                        jQuery(document).location.href = response.redirect;
                        return;
                    }
                    jQuery('#create-please-wait').hide();
                    jQuery('#create').removeAttr('disabled');
                    jQuery('#ajaxlogin-create-form .buttons-set')
                        .removeClass('disabled')
                        .css('opacity','1');
                }
            });
        });

        jQuery('#ajaxlogin-forgot-password-form') && jQuery('#ajaxlogin-forgot-password-form').bind('submit', function(e) {
            if (typeof e != 'undefined') { // ie9 fix
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
            e.stopPropagation();

            if (!ajaxForgotForm.validator.validate()) {
                return false;
            }

            jQuery('#forgot-please-wait').show();
            jQuery('#btn-forgot').attr('disabled', 'disabled');
            jQuery('#ajaxlogin-forgot-password-form .buttons-set')
                .addClass('disabled')
                .css('opacity','0.5');

            jQuery.ajax({
                type:'POST',
                url: jQuery('#ajaxlogin-forgot-password-form').attr("action"),
                data: jQuery('#ajaxlogin-forgot-password-form').serialize(),
                success: function (transport){
                    jQuery('#ajaxlogin-forgot-window').find('.messages').remove();
                    var response = jQuery.parseJSON(transport);
                    if (response.error) {
                        jQuery('<ul class="messages"></ul>').insertBefore('form#ajaxlogin-forgot-password-form');
                        jQuery('.messages').append('<li class="error-msg"><ul>'+response.error+'</ul></li>');
                    }else if(response.message){
                        jQuery('<ul class="messages"></ul>').insertBefore('form#ajaxlogin-forgot-password-form');
                        jQuery('.messages').append('<li class="success-msg"><ul>'+response.message+'</ul></li>');
                        BC.Login.activate('login');
                    }

                    jQuery('#forgot-please-wait').hide();
                    jQuery('#btn-forgot').removeAttr('disabled');
                    jQuery('#ajaxlogin-forgot-password-form .buttons-set')
                        .removeClass('disabled')
                        .css('opacity','1');
                }
            });
        });

        jQuery('#ajaxlogin-forgot-password-form').find('.ajaxlogin-login') && jQuery('#ajaxlogin-forgot-password-form').find('.ajaxlogin-login').bind('click', function(e) {
            e.preventDefault();
            BC.Login.activate('login');
        });
    },
    center: function() {
        var viewportSizeWidth   = jQuery(document).width(),
            left, top;

        if ('undefined' === typeof viewportSizeWidth) { // mobile fix. not sure is this check is good enough.
            top  = '25%';
            left = '25%';
        } else {
            if(viewportSizeWidth >= 768){
                top = '25%';
                left = '35%';
            }else{
                top = '25%';
                left = '25%';
            }

        }

        jQuery('.ajaxlogin-window').css({left:left, top:top});
        this.centered = true;

        return this;
    },
    hide: function() {
        jQuery('#ajaxlogin-mask').remove();
        jQuery('#select').removeClass('ajaxlogin-hidden');

        if (this.modal || !jQuery(BC.Login.window).is(":visible")) {
            return;
        }
        if(jQuery('body').find('.messages')){
            jQuery('body').find('.messages').remove();
        }
        if (BC.Login.config.destroy) {
            jQuery(BC.Login.window).remove();
        } else {
            jQuery(BC.Login.window).hide();
        }

    },

    setModal: function(flag) {
        this.modal = flag;

        if (flag) {
            jQuery(BC.Login.window).find('.close')[0].hide();
        } else {
            jQuery(BC.Login.window).find('.close')[0].show();
        }
        return this;
    },
    activate: function(trigger) {
        var trigger = BC.Login.config.triggers[trigger];
        BC.Login.update(trigger.window.show(), trigger.size).show();
    }

};
