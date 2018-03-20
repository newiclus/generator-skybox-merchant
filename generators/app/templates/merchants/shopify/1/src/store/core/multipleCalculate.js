function showPriceMultiC(productId, dataResp) {
  var prefModal = ($(".remodal-is-opened").length > 0) ? ".js-quick-shop " : ""; // only for modal
  $(prefModal + '#skybox-product-price-' + productId).html(dataResp.responseText);
  $(prefModal + '#skybox-product-price-' + productId).removeClass('empty-price');
  $(".skbx-loader-" + productId).hide();    
}

function multipleCalculate (variant) {

  Sdk.getLocationAllow().then(function () {    
    $("[class*=skbx-loader]").html(`
      <div>
        <img style="height: 15px;width: 100px !important" src="https://552f6073.ngrok.io/skybox-sdk/assets/img/loaderBlackBlue.gif" />
      </div>
    `);

    let ListProducts_Array = [],
        ListProducts = {};

    Sdk.getAuthCart().then(function (store) {
      $(".internationalPrice").each((i, element) => {

        let elementId = element.getAttribute('id'),
            product = JSON.parse(element.getAttribute('data')),
            variantID = element.getAttribute('data-variant-id');

        if (elementId && product) {

          let id_shopify_product_variant = String(variantID),
              title = product.variants[0].name,
              price = parseFloat(product.variants[0].price / 100),
              images = product.featured_image,
              sku = product.variants[0].sku,
              product_type = product.type;

          let getWeight = Sdk.calcWeightAndUnit(product.variants[0].weight);

          if (!id_shopify_product_variant) {
            id_shopify_product_variant = String(product.id);
          }

          if (__cnStore.CONF.PRODUCT_TYPE_DEFAULT !== '') {
            product_type = __cnStore.CONF.PRODUCT_TYPE_DEFAULT;
          }

          if (sku === '') {
            sku = id_shopify_product_variant;
          };

          var idObj = id_shopify_product_variant + 
                      '__' + Sdk.Common().getDate() + 
                      store.Data.CART_SKY.Country.Iso + 
                      store.Data.CART_SKY.Cart.Currency;
      
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
            console.log('::MULTIPLECALCULATE PRODUCT FALTANTE POR weight', id_shopify_product_variant + ',' + product_type);
            $(".skbx-loader-" + id_shopify_product_variant).html('<span>Product not available in your country</span>');
            $('#addToCart-product-template').prop('disabled', true);
          }
        }
      });

      ListProducts_Array = _.uniq(ListProducts_Array, false, function (pred) {
        return pred.HtmlObjectid;
      });

      ListProducts = { ListProducts: ListProducts_Array };

      if (ListProducts_Array.length > 0) {
        Sdk.getMulticalculate(ListProducts).then(function (urlHtml) {
          // add new attribute: success [state]
          urlHtml.Data.forEach(element => {
            element.success = false;
          });

          var count = 0;
          var showPriceTimer = setInterval(function () {
            getHtmlMultipleCalculate(urlHtml);
            // Verify all success states from every urlHTML object
            urlHtml.Data.forEach(element => {
              if (element.success) {
                count+=1;
              }
            });
            // Kill setInterval
            if (count == urlHtml.Data.length) {
              clearInterval(showPriceTimer);
            }
          }, 1000);
        }).catch(function (error) {
          console.log(error);
          $("span[class^='skbx-price']").hide();
        });
      }

      function getHtmlMultipleCalculate(res, array) {
        let productId = "";
        let url = "";
        let __Res = [];

        for (let i = 0; i < res.Data.length; i++) {
          productId = res.Data[i].HtmlObjectId.toString().split('__')[0];
          url = res.Data[i].Url;
          
          (function (productId, url, i) {
            //Verify if the success status is false
            var x = productId;
            if (!res.Data[i].success) {

              return api.get(url).then(function (dataResp) {
                //restricted product
                if (dataResp.responseText.length > 1) {
                  showPriceMultiC(productId, dataResp);

                  if ($(dataResp.responseText).is('span.not-available')) {
                    $('#addToCart-product-template').prop('disabled', true);
                  }
                  else {
                    $('#addToCart-product-template').prop('disabled', false);
                  }

                  $('#' + 'skybox-product-price-' + productId).html(dataResp.responseText);
                  $(".skbx-loader-" + productId).hide();
                  // Change the success status to avoid another request
                  res.Data[i].success = true;           
                }
              }).catch(function (error) {
                console.log('getHtmlMultipleCalculate2', error);
              });
            }
          })(productId, url, i);
        }
      }
    });
  }).catch(function (err) {
    console.warn('LocationAllow::', err);
  });
}