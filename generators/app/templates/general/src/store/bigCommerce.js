$(document).ready(function () {
    require('../../node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css');
    require('../../assets/css/bigCommerce.css');

    const fancybox = require("@fancyapps/fancybox");
    const __cnApi = require('../../config/api.json');
    const __cnStore = require('../../config/store.json');
    const api = require('../api')
    const Sdk = require('../sdk');
    const path_home = require("path");

    var SKYBOX_URL = __cnApi.SKYBOX_CHECKOUT_URL;
    var widthPage = window.outerWidth;
    var heightPage = window.outerHeight;
    var merchant = '';

    Sdk.Common().Init();

    eventoClickButton = function () {
        console.log('eventoClickButton');
        setTimeout(function () {
             Sdk.Common().Init();
        }, 2000);
    };

    var updateElements = function () {
        // Peak
        $('section.section').css('padding', '0');
        $('h1.page-title').css('display', 'none');
        $('p.post-meta').css('display', 'none');
        $('.share-buttons-nav').css('display', 'none'); // Peak
        // Cornerstone
        $('h1.page-heading').css('display', 'none');

        // Peak
        if ($('.container-small').length > 0) {
            $('.container-small').css('max-width', 'calc(65% - 50px)');
        }
        // Cornerstone
        if ($('.page-content--centered').length > 0) {
            $('.page-content--centered').css('width', '100%');
        }
        if ($('.post-main').length > 0) {
            $('.post-main').css('max-width', '80%');
        }
    };
    // Show Country & Currency Bar
    if ($('#skybox-checkout-change-country').length > 0) {
        Sdk.Common().loadAssets();
        Sdk.getIntegrationType().then(function (ind) {
            if (ind === 3) {
                Sdk.getBarHtmlTemplate().then(function (content) {
                    $('#skybox-checkout-change-country').html(content);
                    $('#skybox-checkout-change-country table, #skybox-checkout-change-country table td').css('padding', '0px');
                    $('#skybox-checkout-change-country table, #skybox-checkout-change-country td').css('border', '0px');

                    Sdk.getCart().then(function (cart) {
                        $('.skx_banner_image_account').click(function () {
                            var datos = cart.DataUrl;
                            var url = SKYBOX_URL;
                            var idCart = '';
                            var name = '';
                            /*//if (data.IsRegistrationDisabled == 1) {
                            if (true) {
                                name            = 'tracking';
                                url             += "Webforms/PublicSite/Tracking.aspx?" + datos + "&merchant="
                                                    + merchant + "&idCart=" + idCart;
                            } else {                             
                            }*/
                            name = 'initSession';
                            url += "APILoginCustomer.aspx?" + datos + "&merchant=" + merchant
                                + "&idCart=" + idCart + "&ReLoad=1&uri=" + __cnStore.STORE_URL + '?LoadFrame=1';

                            var widthpopup = (widthPage - 50).toString();
                            var heightpopup = ((heightPage < 800) ? heightPage - 50 : 800).toString();
                            Sdk.Common().showPopup(name, url, widthpopup + 'px', heightpopup + 'px');
                        });

                        $('.skx_position_option_country').click(function () {
                            var datos = cart.DataUrl;
                            var return_url = document.URL.replace('#', '') + '?return_url=1';
                            var url = SKYBOX_URL + "Webforms/PublicSite/ReSync.aspx?"
                                + datos + "&process_url=" + return_url;
                            Sdk.Common().showPopup('selectLocation', url, '540px', '640px');
                        });
                    });
                }).catch(function (error) {
                    console.log(error);
                });
            };
        });
    }

    // Skybox Ckeckout page & Iframe Source
    if ($(location).attr('href').indexOf(__cnStore.CHECKOUT_PAGE) > -1) {
        updateElements();

        var content = $('#skybox-international-checkout');
        //var loadingImage = require('../../assets/img/loader.gif');
        //content.append('<h1 id="mensaje" style="text-align:center;"><img src="https://f31ada3b.ngrok.io/sbybox-sdk-js/dist/' + loadingImage + '"/></h1>');
        content.append('<h1 id="mensaje" style="text-align:center;"><img src="https://apishopify.skyboxcheckout.com/bigcommerce/assets/images/loader.gif"/></h1>');

        api.get('/api/storefront/carts').then(function (res) {
            var bc_cart_id = JSON.parse(res.responseText)[0];
            if (typeof bc_cart_id == 'undefined') {
                alert("Cart emptyt!");
                return;
            }

            Sdk.getButton().then(function (button) {
                var height = 2500;
                if (/Mobi/.test(navigator.userAgent)) {
                    height = window.parent.innerHeight;
                    height = height * 7;
                }

                Sdk.getCart().then(function (cart) {
                    var datos = cart.DataUrl;
                    var iframeUrl = button.Url + '&idCart=' + bc_cart_id.id + '&idStore=' + __cnStore.STORE_HASH
                        + '&UrlR=' + __cnStore.STORE_URL + '/skybox-checkout-success/?i={idPurchase}&'
                        + datos;
                    var myIframe = jQuery('#skybox-international-checkout > iframe');
                    myIframe.attr('src', iframeUrl);
                    myIframe.attr('height', height);
                    myIframe.hide();

                    myIframe.load(function () {
                        $('#mensaje').html('');
                        $(this).show();
                    });
                });
            });
        });
    }

    // Skybox Ckeckout Successfull page & Invoice Source
    if ($(location).attr('href').indexOf(__cnStore.SUCCESSFUL_PAGE) > -1) {
        updateElements();

        if ($('#skybox-international-checkout-invoice').length > 0) {
            Sdk.getCartInvoice().then(function (content) {
                $('#skybox-international-checkout-invoice').html(JSON.parse(content).Data.Invoice);
            });
        }
    };

    // Applied to "Cornerstore theme" (or related) that dynamically loading a mini-cart section.
    $("[data-cart-preview]").click(function () {
        $(this).ready(function () {
            setTimeout(function () {
                Sdk.Common().Init();
            }, 750);
        });
    });
});
