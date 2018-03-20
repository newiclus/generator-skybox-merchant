import { setTimeout } from 'timers';
import SkyboxSDK from '@skyboxcheckout/merchant-sdk';

const _ = require('underscore');
const shopifyStyles = require('../../assets/css/shopify.css');
const path_home = require("path");
const arrayDiff = require('simple-array-diff');
// Storage
const engine = require('store/src/store-engine');
const storage = {
  local: [require('store/storages/localStorage')],
  session: [require('store/storages/sessionStorage')]      
};    
const localStore = engine.createStore(storage.local, []);
const sessionStore = engine.createStore(storage.session, []);
// Local libs
const __cnStore = require('../../config/store.json');
const api = require('../xhr');

const Sdk = new SkyboxSDK({
  IDSTORE: 'Your ID Store',
  MERCHANT: 'Your Merchant',
  MERCHANTCODE: 'Your Merchant Code',
  STORE_URL: 'Your URL Store',
  SUCCESSFUL_PAGE: "Your success page",
  CHECKOUT_PAGE: 'Your checkout page',
  CHECKOUT_BUTTON_CLASS: 'your button class'
});


(function () {
  $(document).ready(function () {
    
    var widthPage = window.outerWidth;
    var heightPage = window.outerHeight;
    var merchant = '';


    Sdk.Common().initChangeCountry();

    function hideLoaderds(id) {
      $(".skbx-loader-" + id).hide();
    }    

    const func_updateShoppingCart_hrml = require('./core/updateShoppingCart_hrml');
    
    const func_addProductItems = require('./core/addProductItems');

    const func_multipleCalculate = require('./core/multipleCalculate');

    const func_getRestrictedElems = require('./core/getRestrictedElems');

    const func_validateRestriction = require('./core/validateRestriction');

    const func_validate2 = require('./core/validate2');

    const func_synchronizeCart = require('./core/synchronizeCart');

    const func_searchVariant = require('./core/searchVariant');


    // Get Event Listener
    (function (open) {
      XMLHttpRequest.prototype.open = function () {
        this.addEventListener("readystatechange", function(e) {
          var respondURL = Sdk.Common().detectInternetExplorer() ? this._url : this.responseURL;
          if (!_.isUndefined(respondURL)) {           
            if (window.location.href.indexOf('/cart') === -1) {
              if (this.status == 200 && respondURL.match(/cart.js/g) && this.readyState == 4) { 
                if (this.responseText && this.responseText.length > 0) {
                  synchronizeCart(this);
                }
              }
            }
          }
        }, false);
        open.apply(this, arguments);
      };
    })(XMLHttpRequest.prototype.open);


    //listen variants
    $('body').on('change', 'select', function (e) {
      var currentUrl = $(location).attr('href');

      if (currentUrl.match(/[?]variant=/gi)) {
        var currentCode = currentUrl.split("?variant=")[1];
        searchVariant(currentCode);
      }
    });

    // load menos pagina cart
    if (window.location.href.indexOf('/cart') === -1 && window.location.href.indexOf(__cnStore.SUCCESSFUL_PAGE) === -1) {
      // api.get('/cart.js').then(function() {
      //   console.log('call cart.js');
      // });
      Sdk.getLocationAllow().then(function () {
        // var indice = sessionStore.get('auth-store').Data.LocationAllow;

        // if (indice > 0) {
          setTimeout(() => {
            multipleCalculate();
          }, 500);

          api.get('/cart.js');

          // Sdk.getCartRefresh().then(function(Cart) {
          //   // validate2(Cart);
          //   validateRestriction(Cart);
          // });
        // }
      }).catch(function (err) {
        console.warn('LocationAllow::', err);
      });
    }

    if (window.location.href.indexOf('/cart') > -1) {
      api.get('/cart.js')
      .then(function(data) {
        synchronizeCart(data);
      }).catch(function (error) {
        console.log('::synchronizeCart ', error);
      });
    }
    
    // Skybox Ckeckout page & Iframe Source
    if ($(location).attr('href').indexOf(__cnStore.CHECKOUT_PAGE) > -1) {

      $('header').text('');
      $(".payment_methods").css('display', 'none');

      Sdk.showCheckoutIframe();
    }

    if ($(location).attr('href').indexOf(__cnStore.SUCCESSFUL_PAGE) > -1) {

      if ($('#skybox-international-checkout-invoice').length > 0) {
        
        $('#skybox-international-checkout-invoice').html(`
          <h1 id="mensaje" style="text-align:center;">
            <img src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif"/>
          </h1>
        `);
        
        api.get(__cnStore.STORE_URL + '/cart/clear.js').then(() => {
          Sdk.getCartInvoice().then(function (content) {
            var content = JSON.parse(content).Data.Invoice
            var invoice = document.getElementById('skybox-international-checkout-invoice');

            invoice.innerHTML = content;
            sessionStore.remove('cart_prod_arr');
            var cartBtn = $($(".header-cart-btn span")[1]);
            cartBtn.addClass('hidden-count');
          });
        });
      }
    }
  });
})();
