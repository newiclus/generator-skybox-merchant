(function () {
  $(function () {
    require('../../node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css');
    require('../../assets/css/3dCart.css');

    const $ = require('jquery');
    const fancybox = require("@fancyapps/fancybox");
    const __cnApi = require('../../config/api.json');
    const __cnStore = require('../../config/store.json');
    const api = require('../api')
    const Sdk = require('../sdk');

    const SKYBOX_URL = __cnApi.SKYBOX_CHECKOUT_URL;
    var widthPage = window.outerWidth;
    var heightPage = window.outerHeight;
    var merchant = '';

    let ListProducts ='{"ListProducts":[{"HtmlObjectid":"1","Sku":"MH07-XS-Green","Name":"Hero Hoodie-XS-Green","Category":"90","Price":60,"ImgUrl":"http%3A%2F%2F50.16.251.61%2Fmagento19%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fimage%2F265x%2F9df78eab33525d08d6e5fb8d27136e95%2Fw%2Fb%2Fwbk003t.jpg","Weight":1,"WeightUnit":"LBS","Quantity":1,"ProductMerchantId":""}]}';

    /*Sdk.getIP().then(function(res){
      console.log('::getIP()::', res)
      return Sdk.getAuthCart();
    }).then(function(dato){
      console.log('::getAuth()::', dato)
      return Sdk.getButton();
    }).then(function(dato){
      console.log('::getButton()::', dato)
      return Sdk.getIntegrationType();
    }).then(function(dato){
      console.log('::getIntegrationType()::', dato)
      return Sdk.getMulticalculate(JSON.parse(ListProducts));
    }).then(function(dato){
      console.log('::getMulticalculate()::', dato)
    });*/
    Sdk.getMulticalculate(JSON.parse(ListProducts)).then(function(resp){
      console.log(resp);
    })

    $('.chk-buttons')
      .append('<div class="skybox-checkout-payment-btn" style="margin-bottom:15px;margin-top:10px;"></div>');

    Sdk.Common().Init();
    var bc_cart_id = Sdk.Common().readCookie('incompleteorderid');
    setTimeout(function () {
     // $('.skybox-checkout-payment-btn').find('a').addClass('btn');
    }, 1000);


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


    if ($(location).attr('href').indexOf(__cnStore.CHECKOUT_PAGE) > -1) {
      var content = $('#skybox-international-checkout');
      content.append('<h1 id="mensaje" style="text-align:center;"><img src="https://apishopify.skyboxcheckout.com/bigcommerce/assets/images/loader.gif"/></h1>');
      var bc_cart_id = Sdk.Common().readCookie('incompleteorderid');
      if (typeof bc_cart_id == 'undefined' || bc_cart_id.length === 0) {
        alert("Cart emptyt!");
        return;
      }

      Sdk.getButton().then(function (button) {
        $('.breadcrumbs').hide();
        $('.page_headers').addClass('page_headers-3dCart');
        var height = 2500;
        if (/Mobi/.test(navigator.userAgent)) {
          height = window.parent.innerHeight;
          height = height * 7;
        }

        Sdk.getCart().then(function (cart) {
          var datos = cart.DataUrl;
          var iframeUrl = button.Url + '&idCart=' + bc_cart_id + '&idStore=' + __cnStore.STORE_HASH
            + '&UrlR=' + __cnStore.STORE_URL + '/skybox-checkout-success_ep_43-1.html/?i={idPurchase}&'
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
    }


    if ($(location).attr('href').indexOf(__cnStore.SUCCESSFUL_PAGE) > -1) {
      if ($('#skybox-international-checkout-invoice').length > 0) {
        Sdk.getCartInvoice().then(function (content) {
          $('#skybox-international-checkout-invoice').html(JSON.parse(content).Data.Invoice);
        });
      }
    };
  })
})();


