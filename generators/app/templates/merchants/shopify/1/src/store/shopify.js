import { setTimeout } from 'timers';
import SkyboxSDK from 'skybox-sdk';
//import Client from 'shopify-buy';

(function () {
  $(document).ready(function () {
    require('../../assets/css/shopify.css');
    const __cnStore = require('../../config/store.json');
    const _ = require('underscore');
    const api = require('../api')    
    const path_home = require("path");
    //Session/Local Storage
    const engine = require('store/src/store-engine');
    const storage = {
      local: [require('store/storages/localStorage')],
      session: [require('store/storages/sessionStorage')]      
    };    
    const localStore = engine.createStore(storage.local, []);
    const sessionStore = engine.createStore(storage.session, []);

 
    var widthPage = window.outerWidth;
    var heightPage = window.outerHeight;
    var merchant = '';

    const Sdk = new SkyboxSDK({
      IDSTORE: '00286',
      MERCHANT: 'Q01VQULKSUZVUK1ZNFNNTTLLVUTGUEFBUVZLNUMZMLE',
      MERCHANTCODE: '2f226e3f-60ac-4e1c-9b95-5a1b0c46da27',
      STORE_URL: 'https://sbcmerchant.myshopify.com/',
      SUCCESSFUL_PAGE: "/pages/checkout-success",
      CHECKOUT_PAGE: '/pages/order-summary',
      CHECKOUT_BUTTON_CLASS: 'button search-submit'
    });

    //const client = Client.buildClient({
      //domain: 'sbcmerchant.myshopify.com',
      //storefrontAccessToken: 'ac79846dc9d66cb5a1c163c5ae89cf31'
    //});

    //client.product.fetchAll().then((products) => {
      // Do something with the products
      //console.info("Products: ", products);
    //});


    Sdk.Common().Init();
    Sdk.Common().initChangeCountry();

    var updateElements = function () {
      // Peak
      $('section.section').css('padding', '0');
      $('.drawer a').css('color', '#fffff');
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


    // Skybox Ckeckout page & Iframe Source
    if ($(location).attr('href').indexOf(__cnStore.CHECKOUT_PAGE) > -1) {
      updateElements();
      $('header').text('');
      $(".payment_methods").css('display', 'none');

      Sdk.showCheckoutIframe();
    }

    // Skybox success page
    if ($(location).attr('href').indexOf(__cnStore.SUCCESSFUL_PAGE) > -1) {
      
      if ($('#skybox-international-checkout-invoice').length > 0) {
        
        $('#skybox-international-checkout-invoice').html(`
          <h1 id="mensaje" style="text-align:center;">
            <img src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif"/>
          </h1>
        `);
        
        $.ajax({
          url: '/cart/clear.js',
          dataType: 'json',
          cache: false,
          success: function (data) {
            Sdk.getCartInvoice().then(function (content) {
              var content = JSON.parse(content).Data.Invoice
              var invoice = document.getElementById('skybox-international-checkout-invoice');

              invoice.innerHTML = content;

              localStore.remove('current_cart');
              sessionStore.remove('cart_prod_arr');
              window.current_cart = [];
              updateMiniCartYgea();
            });
          }
        });
      }
    };

    //En el caso que el tema tenga paginacion
    if (__cnStore.CONF.PAGINATION_PRODUCTS.VALUE == "TRUE") {
      let cantLista = $(__cnStore.CONF.PAGINATION_PRODUCTS.ID_DIV_PAGINACION).length;
      $(window).scroll(function () {
        let canElmen = 0;
        let cant = $(__cnStore.CONF.PAGINATION_PRODUCTS.ID_DIV_PAGINACION).length;
        if (cantLista !== cant && canElmen == 0) {
          cantLista = cant;
          canElmen = 1;
          multipleCalculate();
        }
      });
    }

    //load menos pagina cart
    if (window.location.href.indexOf('cart') === -1 && window.location.href.indexOf(__cnStore.SUCCESSFUL_PAGE) === -1 ) {
      setTimeout(function () {        

        verifyCartProducts(updateMiniCartYgea);

        Sdk.getConcepts().then(function (html) {
          if (html.Data.Concepts.length > 0) {
            let htmlCart = Sdk.Common().conceptsTableCart(html);
            $('.international-checkout').html(htmlCart);
          }
        }).catch(function(error) {
          SKY_STORE_ENABLE = false;
        });

        multipleCalculate();
      }, 1000);

      if (SKY_STORE_ENABLE) {
        //for the moment: disabled add button until the load price
        $('#skybox-checkout-change-country .skx_banner_label_currencyISO').text('Change Country');
        $(".skybox-form-cart-add-item").addClass('disabled').prop('disabled', true);        
      }
    }

    //LOAD CART
    if (window.location.href.indexOf('cart') > -1) {
      var cartButton = $(".header .cart-button");
      var answer = true;
      
      cartButton.on("click", function() {
        waitForCartCalc(answer);
      }); //*/

      $.getJSON(__cnStore.STORE_URL+'/cart.js')
       .done(function( data ) {
          //Update local cart
          localStore.set('current_cart', data);
          window.current_cart = data;
          let elemCart = data.items;

          Sdk.getLocationAllow().then(function (LocationAllow) {
            //Verificar MiniCart
            verifyCartProducts(function() {
              processXHR(elemCart);
              updateCart();
              window.setTimeout(function() {
                answer = false;
                waitForCartCalc(false);
              }, 1000);
            });
          }).catch(function (error) {
            $('#skybox-checkout-change-country .skx_banner_label_currencyISO').text('Change Country');
            answer = false;
            waitForCartCalc(false);
          });
      });
    }


    function detectInternetExplorer() {
      var ua = navigator.userAgent;
      if ( ua.match(/Trident/g) ) {
        return true;
      }
      return false;
    }

    function multipleCalculate(carro) {
      Sdk.getLocationAllow().then(function () {
        let ListProducts = {};
        let ListProducts_Array = [];

        Sdk.getAuthCart().then((store) => {
          $(".internationalPrice").map(function () {
            var this_id = this.id;
            //variant code store
            var id_shopify_product_variant = this_id.replace(/skybox-product-price-/g, ''),
                title = window.jQuery('#' + id_shopify_product_variant + '-title').val(),
                price = (window.jQuery('#' + id_shopify_product_variant + '-price').val()),
                weight = window.jQuery('#' + id_shopify_product_variant + '-weight').val(), //In grams
                weight_unit = window.jQuery('#' + id_shopify_product_variant + '-weight_unit').val(),
                images = window.jQuery('#' + id_shopify_product_variant + '-images').val(),
                sku = window.jQuery('#' + id_shopify_product_variant + '-sku').val(),
                product_type = window.jQuery('#' + id_shopify_product_variant + '-product_type').val(),
                images = window.jQuery('#' + id_shopify_product_variant + '-images').val();            

            if (__cnStore.CONF.PRODUCT_TYPE_DEFAULT !== '') {
              product_type = __cnStore.CONF.PRODUCT_TYPE_DEFAULT;
            }
            //if the weight is 0, then the default weight is 1
            var getWeight = calcWeightAndUnit(weight);

            let date = new Date();
            //HTMLID+CARTID(GUID)+yyyyMMddHHmm+ISOCOUNTRY+CURRENCY                  

            let idObj = id_shopify_product_variant + '__' + Sdk.Common().getDate() + store.Data.CART_SKY.Country.Iso + store.Data.CART_SKY.Cart.Currency;
            //console.log(':::::::::::__', idObj)
            $(".skbx-loader-" + id_shopify_product_variant).html(`
              <div>
                <img style="height: 40px;" src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif" />
              </div>
            `);

            if (getWeight.weight > 0 && product_type !== '' && sku !== '') {
              ListProducts_Array.push(
                {
                  HtmlObjectid: idObj,
                  Sku: sku,
                  Name: title,
                  Category: product_type,
                  Price: price,
                  ImgUrl: images,
                  Weight: getWeight.weight,
                  WeightUnit: getWeight.unit
                }
              );
            }
            else {
              console.log('::MULTIPLECALCULATE PRODUCT FALTANTE POR weight', id_shopify_product_variant + ',' + product_type)
              //$(".skbx-loader-" + id_shopify_product_variant).hide();
              $('#' + id_shopify_product_variant).hide();
              $(".skbx-loader-" + id_shopify_product_variant).html('<span class="not-available">Product not available in your country</span>');
              disabledAddButton();
            }
          });

          ListProducts_Array = _.uniq(ListProducts_Array, false, function (pred) {
            return pred.HtmlObjectid;
          });

          ListProducts = {
            ListProducts: ListProducts_Array
          };

          if (ListProducts_Array.length > 0) {
            console.log(ListProducts);
            Sdk.getMulticalculate(ListProducts).then(function (urlHtml) {
              // add new attribute: success [state]
              urlHtml.Data.forEach(function(element) {
                element.success = false;
              });

              var count = 0;
              var showPriceTimer = setInterval(function () {

                getHtmlMultipleCalculate(urlHtml);
                // Verify all success states from every urlHTML object
                urlHtml.Data.forEach(function(element) {
                  if (element.success) {
                    count+=1;
                  }
                });

                // Kill setInterval
                if (count == urlHtml.Data.length) {
                  clearInterval(showPriceTimer);
                }

              }, 500);

            }).catch(function (error) {
              console.log(error);
              $("span[class^='skbx-price']").hide();
            });
          }

          function getHtmlMultipleCalculate(res) {
            let productId = "";
            let url = "";
            let __Res = [];

            for (let i = 0; i < res.Data.length; i++) {
              productId = res.Data[i].HtmlObjectId.toString().split('__')[0];
              url = res.Data[i].Url;

              (function (productId, url, i) {
                //Verify if the success status is false
                if (!res.Data[i].success) {
                  return api.get(url).then(function (dataResp) {

                    if (dataResp.responseText.length > 1) {
                      $(".skybox-product-price-" + productId).html(dataResp.responseText);
                      $(".skbx-loader-" + productId).hide();
                      // Change the success status to avoid another request
                      res.Data[i].success = true;
                      
                      //Check availability of product
                      disabledAddButton();
                    }

                  }).catch(function (error) {
                    console.log('getHtmlMultipleCalculate2', error);
                  });
                }
              })(productId, url, i);
            }
          }
        });
      }).catch(function (error) {
        console.warn('LocationAllow::', error);
      });
    }

    function disabledAddButton() {
      const internationalPrice = document.querySelector(".internationalPrice");
      const productId = internationalPrice.getAttribute('data-product-id');
      const notAvaliable = $(".product-"+productId+" .product_section .not-available");

      if (notAvaliable.length >= 1) {
        $(".skybox-form-cart-add-item").css('display', 'none');        
      }
      else {
        $(".skybox-form-cart-add-item").removeClass('disabled').prop('disabled', false);
      }
    }

    function processXHR(elemCart) {
      let cantInput = elemCart.length;
      console.log(":::::CantInput", cantInput)
      let cart_prod_arr = sessionStore.get('cart_prod_arr') || [];
      let id = '';

      if (cantInput > 0) {
        //Add Loading Product
        loadingMiniCartYgea();
        //Actualiza Carrito, cantidades
        if (cantInput === cart_prod_arr.length) {
          let Productos = [];
          for (let i = 0; i < cantInput; i++) {
            let idStore = elemCart[i].variant_id.toString();
            let cantidad = elemCart[i].quantity;
            if (cart_prod_arr !== null && _.isArray(cart_prod_arr)) {
              for (let x = 0; x < cart_prod_arr.length; x++) {
                if (idStore === cart_prod_arr[x].idProducto.split('-')[0]) {
                  id = cart_prod_arr[x].idProducto.split('-')[1];
                }
              }
            }
            let Produts = {
              Id: id,
              Quantity: cantidad
            };

            Productos.push(Produts);
          }
          let Products = {
            'Product': Productos
          };

          Sdk.editProductsCart(Products).then(function (response) {
            return Sdk.Common().getCartRefresh();
          }).then(function () {
            return Sdk.getConcepts();
          }).then(function (html) {
            //updateShoppingCart_hrml2(elemCart);
            updateMiniCartYgea();
            let htmlCart = Sdk.Common().conceptsTableCart(html);
            $(".skbx-loader-checkout-price").css('display', 'none');
            $('.international-checkout').html(htmlCart);
          });

        } else {
          //Elimina producto 
          let cart_prod_arr_aEliminar = [];
          for (let i = 0; i < cantInput; i++) {
            if (cart_prod_arr_aEliminar.length > 0) {
              cart_prod_arr = cart_prod_arr_aEliminar;
            }
            cart_prod_arr_aEliminar = _.filter(cart_prod_arr, function (id) {
              return id.idProducto.split('-')[0] !== elemCart[i].variant_id.toString();
            });
          }
          for (let a = 0; a < cart_prod_arr_aEliminar.length; a++) {
            let id = cart_prod_arr_aEliminar[a].idProducto.split('-')[1];
            (function (id) {
              Sdk.removeProductCart(id).then(function (res) {
                console.log('eliminado cart', id)
                let cart_prod_arrNew = _.filter(sessionStore.get('cart_prod_arr'), function (num) {
                  return num.idProducto.split('-')[1] !== id;
                });
                sessionStore.set('cart_prod_arr', []);
                sessionStore.set('cart_prod_arr', cart_prod_arrNew);
                return Sdk.getConcepts();
              }).then(function (html) {
                //updateShoppingCart_hrml2(elemCart);
                updateMiniCartYgea();
                let htmlCart = Sdk.Common().conceptsTableCart(html);
                $(".skbx-loader-checkout-price").css('display', 'none');
                $('.international-checkout').html(htmlCart);
              });
            })(id);
          }
          Sdk.Common().getCartRefresh();
        }
      }
      else {
        //Add Loading Product
        loadingMiniCartYgea();

        //ELiminar carrito
        Sdk.deleteProductsCart().then(function (res) {
          sessionStore.remove('cart_prod_arr');
          updateMiniCartYgea();
        });
      }
    }
   
    function verifyCartProducts(funct) {
      Sdk.getLocationAllow().then(function (LocationAllow) {
        var cartSkybox = sessionStore.get('cart_prod_arr') || [];
        var cartShop = localStore.get('current_cart');

        if (cartShop && cartShop.items.length > cartSkybox.length && cartSkybox.length === 0) {
          var ListProducts = cartShop.items.reverse();

          Sdk.deleteProductsCart().then(function () {
            addProductItems(ListProducts);
          });
        }
        else {
          funct();
        }
      }).catch(function (error) {
        console.warn('Verify Cart', error);
        //Change Text
        $('#skybox-checkout-change-country .skx_banner_label_currencyISO').text('Change Country');
      });
    }

    //ADD
    //Listen Cart actions
    (function (open) {
      XMLHttpRequest.prototype.open = function () {
        this.addEventListener("readystatechange", function () {

          const respondURL = detectInternetExplorer() ? this._url : this.responseURL;

          if (this.status == 200 && this.readyState == 4) {
            
            if (respondURL.match(/change.js|update.js/g) && this.responseText.length > 0) {              
              let elemCart = JSON.parse(this.responseText).items;
              
              Sdk.getLocationAllow().then(function (LocationAllow) {                
                processXHR(elemCart);
              }).catch(function (error) {
                console.warn('add-item: ', error);
              });
            }


            if (respondURL.match(/add.js/g) && this.responseText.length > 0) {
              let productItem = JSON.parse(this.responseText);

              Sdk.getLocationAllow().then(function (LocationAllow) {
                if (LocationAllow === 1) {
                  productItem.quantity = 1;
                  addProductItems([productItem], "single");
                }
              }).catch(function (error) {
                console.warn('add-item: ', error);
              });
            }
          }          
        }, false);
        open.apply(this, arguments);
      };
    })(XMLHttpRequest.prototype.open);

    //Update Mini Cart from YGEA
    function updateMiniCartYgea () {
      var cart_prod_arr = sessionStore.get('cart_prod_arr') || [];
      var cart = localStore.get('current_cart');


      var $cartBtn = $(".cart-button span"),
          value = $cartBtn.text() || '0',
          cart_items_html = "",
          $cart = $("#cart ul");
      
      $cart.find('li:not(:first)').remove();
      
      if (cart_prod_arr) {
        cart_prod_arr.reverse();
      }

      if (cart && cart.item_count > 0) {
        $cart.find('li.empty_cart').remove();
        $cartBtn.text(cart.item_count);

        $.each(cart.items, function(index, item) {
          var currency = cart_prod_arr[index].Data.Cart.Currency.Iso;
          var price = cart_prod_arr[index].Data.Product.Local.Price;
          
          var line_id = index + 1;
          cart_items_html += '<li class="cart_item">' +
            '<p class="mm-counter">' +
              '<span class="icon-minus minus"></span>' +
              '<input type="number" min="0" class="quantity" name="updates[]" id="updates_' + item.id + '" value="' + item.quantity +'"  data-line-id="' + line_id +'" data-shopify-id="' + item.variant_id + '" readonly />' +
              '<span class="icon-plus plus"></span>' +
            '</p>' +
            '<a href="' + item.url +'">';
          if (item.image) {
            cart_items_html += '<div class="cart_image">' +
                '<img src="' + item.image.replace(/(\.[^.]*)$/, "_medium$1").replace('http:', '') + '" alt="' + htmlEncode(item.title) + '" />' +
              '</div>';
          }

          cart_items_html += '<div class="item_info">' + item.title;

          if(item.properties) {
            $.each(item.properties, function(title, value) {
              if (value) {
                cart_items_html += '<div class="line-item">' + title +': ' + value + '</div>';
              }
            });
          }

          cart_items_html += '<div class="price"><span class="money">'+ currency + ' ' + price  + '</span></div></div></a></li>';
        });

        cart_items_html += '<li class="mm-label">' +
              '<a href="/cart">' +                
                '<div class="international-checkout"></div>' +
              '</a>' +
            '</li>' +
            '<li class="mm-subtitle clearfix">'; //*/

          cart_items_html += '<a href="'+__cnStore.CHECKOUT_PAGE+'" class="skx_btn_checkout action_button right">Proceed to Checkout</a>' +
          '<a href="/cart" class="action_button edit_cart right">Edit Cart</a>' +
          '</li>'; //*/

        $cart.append(cart_items_html);
        $cart.find('li.cart_item:last').addClass('last_cart_item');
        
      }
      else {
        $cartBtn.text(0);
        $cart.empty();
        $cart.append('<li class="mm-subtitle"><a class="continue ss-icon" href="#cart"><span class="icon-close"></span></a></li><li class="empty_cart">Your Cart is Empty</li>');
      }
    }

    //Wait for the Cart update
    function loadingMiniCartYgea(xhr) {
      if (SKY_STORE_ENABLE) {
        var cart_prod_arr = sessionStore.get('cart_prod_arr') || [];
        var cart = window.current_cart || localStore.get('current_cart');

        var $cartBtn = $(".cart-button span"),
            value = $cartBtn.text() || '0',
            cart_items_html = "",
            $cart = $("#cart ul");

        if (cart && cart.item_count > 0) {
          
          if (xhr && xhr === "add") {
            $cart.find('li:not(:first)').remove();
            $cart.find('li.empty_cart').remove();
            $cartBtn.text(cart.item_count);
            
            $.each(cart.items, function(index, item) {              
              var line_id = index + 1;
              cart_items_html += '<li class="cart_item">' +
                '<p class="mm-counter">' +
                  '<span class="icon-minus minus_"></span>' +
                  '<input type="number" min="0" class="quantity" name="updates[]" id="updates_' + item.id + '" value="'+item.quantity+'"  data-line-id="' + line_id +'" data-shopify-id="' + item.variant_id + '" readonly />' +
                  '<span class="icon-plus plus_"></span>' +
                '</p>' +
                '<a href="' + item.url +'">';
              if (item.image) {
                cart_items_html += '<div class="cart_image">' +
                    '<img src="' + item.image.replace(/(\.[^.]*)$/, "_medium$1").replace('http:', '') + '" alt="' + htmlEncode(item.title) + '" />' +
                  '</div>';
              }

              cart_items_html += '<div class="item_info">' + item.title;

              if (item.properties) {
                $.each(item.properties, function(title, value) {
                  if (value) {
                    cart_items_html += '<div class="line-item">' + title +': ' + value + '</div>';
                  }
                });
              }
              cart_items_html += `
                        <div class="price">
                          <div class="skbx-loader">
                            <div><img src="https://cdn.shopify.com/s/files/1/2998/1566/t/2/assets/loading_cart.gif" height="28">
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              `;
            });

            cart_items_html += `
              <li class="mm-label">
                <a href="/cart">                
                  <div class="skbx-loader-checkout-price">
                    <p><img src="https://cdn.shopify.com/s/files/1/2998/1566/t/2/assets/loading_cart.gif" height="28" alt="Loading" /></p>
                  </div>
                </a>
              </li>
              <li class="mm-subtitle clearfix">'
            `;

            cart_items_html += '<a href="'+__cnStore.CHECKOUT_PAGE+'" class="skx_btn_checkout action_button right">Proceed to Checkout</a>' +
              '<a href="/cart" class="action_button edit_cart right">Edit Cart</a>' +
              '</li>'; //*/

            $cart.append(cart_items_html);
            $cart.find('li.cart_item:last').addClass('last_cart_item');
          }
          else {
            $(".international-checkout").html(`
              <div class="skbx-loader-checkout-price">
                <p style="height: 28px; width: 40px;">
                  <img src="https://cdn.shopify.com/s/files/1/2998/1566/t/2/assets/loading_cart.gif" height="28" alt="Loading" />
                </p>
              </div>
            `);
          }
        }
        else {
          $cartBtn.text(0);
          $cart.empty();
          $cart.append(`
            <li class="mm-subtitle">
              <a class="continue ss-icon" href="#cart">
                <span class="icon-close"></span>
              </a>
            </li>
            <li class="empty_cart">Your Cart is Empty</li>
          `);
        }
      }
    }

    function waitForCartCalc(answer) {
      window.setTimeout(function() {
        const contentMiniCart = document.querySelector("form .mm-panels .mm-panel");
        const miniCart = contentMiniCart.querySelector(".mm-listview");

        if (answer) {        
          var htmlStr = `
            <div class="wait-for-calc">
              <p class="saving">Loading<span>.</span><span>.</span><span>.</span></p>
            </div>
          `;
          if (contentMiniCart) {
            miniCart.classList.add('invisible');        
            contentMiniCart.insertAdjacentHTML('beforeend', htmlStr);
          }
        }
        else {        
          const waitNode = contentMiniCart.querySelector('.wait-for-calc');
          if (waitNode) {
            waitNode.parentNode.removeChild(waitNode);
          }
          miniCart.classList.remove('invisible');
        }
      }, 200);
    }

    function calcWeightAndUnit (grams) {
      if ( grams && !isNaN(grams) ) {
        var weight = (grams / 1000).toFixed(2);
        var unit = 'KGS';

        //If the weight is less than 1 KG
        if (weight < 1) {
          weight = (grams * 0.00220462).toFixed(2);
          unit = 'LBS';
        }

        //If the weight is less than 1 LB
        if (unit === 'LBS' && weight < 1) {
          weight = 1;
        }

        return {
          weight: weight,
          unit: unit
        }
      }
      
      console.error("You must put a value in grams");
      return {
        weight: 1,
        unit: 'KGS'
      }
    }

    function addProductItems(products, single) {

      var cart_prod_arr = [];
      var ListProducts = [];      

      if (sessionStore.get('cart_prod_arr') !== null && sessionStore.get('cart_prod_arr') !== '') {
        cart_prod_arr = sessionStore.get('cart_prod_arr');
      }      

      products.forEach(function (productItem) {
        var prod_id = productItem.id;
        var quantity = productItem.quantity;

        var getWeight = calcWeightAndUnit(productItem.grams);        
        
        if (single) {
          //Get quantity from input#quantity
          let input = document.querySelector('form[data-product-id="'+productItem.product_id+'"] #quantity');
          quantity = parseInt(input.value);
        }

        if (productItem.sku === '') {
          productItem.sku = product.id;
        };

        if (__cnStore.CONF.PRODUCT_TYPE_DEFAULT !== '') {
          productItem.product_type = __cnStore.CONF.PRODUCT_TYPE_DEFAULT;
        }

        let Product = {
          HtmlObjectid: productItem.id.toString(),
          Id: productItem.id.toString(),
          Sku: productItem.variant_id.toString(),
          Name: productItem.title,
          Category: productItem.product_type,
          Price: (productItem.price/100),
          ImgUrl: productItem.image,
          Language: "",
          Weight: getWeight.weight,
          WeightUnit: getWeight.unit,
          VolumetricWeight: 0,
          DefinitionOpt: "",
          Quantity: quantity,
          ProductMerchantId: ""
        }

        ListProducts.push({"Product": Product});
      });
      
      //Add Loading Product
      loadingMiniCartYgea("add");

      Sdk.addProductsCart({"ListProducts": ListProducts}).then(function (resp) {
        Sdk.Common().Init();

        var cart_prod_arrNew = [];

        resp.Data.ListProducts.forEach(function (item) {
            //Si tenemos un producto ya agregado en el arreglo, lo actualizamos con la respuesta de addProductCart
            cart_prod_arrNew = _.filter(sessionStore.get('cart_prod_arr'), function (num) {
              return num.idProducto.split('-')[1] !== item.Product.Id.toString();
            });
  
            cart_prod_arrNew.push({
              idProducto: item.Product.Sku + '-' + item.Product.Id,
              Data: item
            });

            cart_prod_arr = [];
            cart_prod_arr = _.map(cart_prod_arrNew, _.clone);
            sessionStore.set('cart_prod_arr', cart_prod_arr);
        });
        
        updateCart();

        //top.location.href = location.href;
        updateMiniCartYgea();

        Sdk.getConcepts().then(function (html) {
          let htmlCart = Sdk.Common().conceptsTableCart(html);
          $('.international-checkout').html(htmlCart);        
        });
      }).catch(function (error) {
        console.log(error);
      });
    }

   
    function refresh(ruta) {
      top.location.href = ruta;
    }

    function updateCart() {
      let cart_prod_arr = [];
      if (sessionStore.get('cart_prod_arr') !== null) {
        cart_prod_arr = sessionStore.get('cart_prod_arr');
      }

      if (cart_prod_arr.length > 0) {
        for (let i = 0; i < cart_prod_arr.length; i++) {
          let idProductStore = cart_prod_arr[i].idProducto.split('-')[0];
          let d = cart_prod_arr[i].Data;
          let CartCurrencyIso = d.Cart.Currency.Iso;

          hideLoaderds(d.HtmlObjectId);

          let skbx_quantity_product = '';
          if (__cnStore.CONF.CARRITO_AJAX == "TRUE") {
            skbx_quantity_product = $("input[id=updates_" + d.HtmlObjectId + "]").val()
          }
          else {
            skbx_quantity_product = jQuery('.skbx-quantity-' + d.HtmlObjectId).val();
          }

          if (typeof skbx_quantity_product === 'undefined')
            skbx_quantity_product = $('.js-qty [type=text]').val();

          //sacamos por el momento el precio del PRODUCT q devuelve el api
          let storeProductPrice = d.Product.Local.Price;
          storeProductPrice = storeProductPrice.replace(/,/g, '');
          let skbx_total_product = 0;
          if (storeProductPrice !== null) {
            skbx_total_product = (skbx_quantity_product * storeProductPrice);
          };

          skbx_total_product = Math.round(skbx_total_product * 100) / 100;
          skbx_total_product = parseFloat(skbx_total_product).toFixed(2);
          skbx_total_product = Sdk.Common().currency_format(skbx_total_product, '');

          storeProductPrice = Math.round(storeProductPrice * 100) / 100;
          storeProductPrice = parseFloat(storeProductPrice).toFixed(2);
          storeProductPrice = Sdk.Common().currency_format(storeProductPrice, '');
          
          $('.skbx-product-only-currency-symbol-with-total-' + d.HtmlObjectId).html(CartCurrencyIso + ' ' + storeProductPrice);
          $('.cart__item-total').html(CartCurrencyIso + ' ' + skbx_total_product);
          $('.cart__item-priceitem-' + d.HtmlObjectId).html(CartCurrencyIso + ' ' + storeProductPrice);
        }
      }
    }

    function hideLoaderds(id) {
      $(".skbx-loader-" + id).hide();
    }

    // Get button Quick View
    var btnsQuickView = document.querySelectorAll('span.quick_shop');
      if (btnsQuickView) {
        Sdk.getLocationAllow().then(function (LocationAllow) {
         
        btnsQuickView.forEach(function(btn)  {
          btn.addEventListener('click', function (event) {

            const formModal = document.querySelector('form.skybox-form-cart-add');
            const productId = formModal.getAttribute('data-product-id');
            const notAvaliable = $(".product-"+productId+" .section .not-available");

            if (notAvaliable.length >= 1) {
              $(".skybox-form-cart-add-item").css('display', 'none');        
            }
          }, false);
        });

      }).catch(function (error) {
        console.error('::Error Allow Location', error);
      });        
    }
  });
})();
