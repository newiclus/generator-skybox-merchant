function synchronizeCart(data) {
  if (data.responseText && data.responseText.length > 0) {
    var elemCart = JSON.parse((data.responseText)).items,
        itemsSky = [],
        operations = [];

    Sdk.getLocationAllow().then(function () {
      Sdk.getCartRefresh().then(function(Cart) {
        if (!_.isUndefined(Cart) && !_.isNull(Cart)) {
          itemsSky = Cart.Data.Cart.Items;

          if (elemCart.length > 0) {
            if (_.isArray(itemsSky) && itemsSky.length > 0) {
              for (let i = 0; i < elemCart.length; i++) {
                elemCart[i].Code = String(elemCart[i].variant_id); 
                elemCart[i].Quantity = String(elemCart[i].quantity);   
              }

              var result = arrayDiff(itemsSky, elemCart, 'Code' );

              var cart_prod_arr_add = result.added,
                  cart_prod_arr_remove = result.removed,
                  cart_prod_arr_common = result.common;
              
              if (cart_prod_arr_add.length > 0) {
                var prod = addProductItems(cart_prod_arr_add);
                operations.push(Sdk.addProductsCart(prod));
              }

              if (cart_prod_arr_remove.length > 0) {
                for (let a = 0; a < cart_prod_arr_remove.length; a++) {
                  let id = cart_prod_arr_remove[a].Id;
                  operations.push(Sdk.removeProductCart(id));
                }
              }

              if (cart_prod_arr_common.length > 0) {
                var array_diff = [];

                for (let a = 0; a < cart_prod_arr_common.length; a++) {
                  let itemStore = cart_prod_arr_common[a];
                  for (let b = 0; b < itemsSky.length; b++) {
                    let itemSky = itemsSky[b];

                    if (itemStore.Code === itemSky.Code) {
                      if ((itemStore.Quantity).toString() !== itemSky.Quantity.toString()) {
                        array_diff.push({ 
                          Id: itemSky.Id,  
                          Quantity: itemStore.Quantity
                        });
                      }
                    }
                  }
                }

                let Products = { 'Product': array_diff };

                operations.push(
                  Sdk.editProductsCart(Products)
                );
              }

              Promise.all(operations).then(function(response) {
                Sdk.Common().elementVisibleStore(false);
                $("[class*=skbx-loader]").html(`
                  <center>
                    <div>
                      <img style="height: 40px;" src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif"  />
                    </div>
                  </center>
                `);

                // var productsResponse = response[0].Data ? response[0].Data.ListProducts : [];
                // var validate = getRestrictedElems(productsResponse, elemCart);
                // var operations2 = validate.operations;
                // var html = validate.html;

                // Promise.all(operations2).then(function() {
                  // if (operations2.length > 0) {
                  //   var modal = new tingle.modal({
                  //     footer: true,
                  //     stickyFooter: true,
                  //     closeMethods: ['overlay', 'button', 'escape'],
                  //     closeLabel: "Close",
                  //     onClose: function() {
                  //       // top.location.reload();
                  //     }
                  //   });

                  //   modal.setContent(html);

                  //   modal.addFooterBtn('Close', 'tingle-btn tingle-btn--default tingle-btn--pull-right', function() {
                  //     modal.close();
                  //   });
              
                  //   //only demo
                  //   $('#ajaxifyModal').removeClass('is-visible');
                  //   modal.open();
                  // }

                  Sdk.getCartRefresh().then(function (Cart2) {
                    Sdk.Common().elementVisibleStore(false);
                    $("[class*=skbx-loader]").html(`
                      <center>
                        <div>
                          <img style="height: 40px;" src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif"  />
                        </div>
                      </center>
                    `);

                    sessionStore.set('cart_prod_arr', []);
                    sessionStore.set('cart_prod_arr', Cart2);

                    updateShoppingCart_hrml(Cart2);

                    Sdk.getConcepts().then(function (html) {
                      let htmlCart = Sdk.Common().conceptsTableCart(html);
                      $('.skbx-loader-subtotal').hide();
                      $('.international-checkout').html(htmlCart);
                    });
                  });
                // });
              }).catch(function(error) {
                console.log(':: synchronizeCart --> Promise.all(operations) error', error);
              });
            } else {
              var prod = addProductItems(elemCart);
              operations.push(Sdk.addProductsCart(prod));

              Promise.all(operations).then((response) => {
                Sdk.Common().elementVisibleStore(false);
                $("[class*=skbx-loader]").html(`
                  <center>
                    <div>
                      <img style="height: 40px;" src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif"  />
                    </div>
                  </center>
                `);
                
                // var productsResponse = response ? response[0].Data.ListProducts : [];
                // var validate = getRestrictedElems(productsResponse, elemCart);
                // var operations2 = validate.operations;
                // var html = validate.html;

                // Promise.all(operations2).then(function() {
                  // if (operations2.length > 0) {
                  //   var modal = new tingle.modal({
                  //     footer: true,
                  //     stickyFooter: true,
                  //     closeMethods: ['overlay', 'button', 'escape'],
                  //     closeLabel: "Close",
                  //     onClose: function() {
                  //       top.location.reload();
                  //     }
                  //   });
              
                  //   modal.setContent(html);

                  //   modal.addFooterBtn('Close', 'tingle-btn tingle-btn--default tingle-btn--pull-right', function() {
                  //     modal.close();
                  //   });
                  //   //only demo
                  //   $('#ajaxifyModal').removeClass('is-visible');
                  //   modal.open();
                  // }

                  Sdk.getCartRefresh().then(function (Cart2) {
                    Sdk.Common().elementVisibleStore(false);
                    $("[class*=skbx-loader]").html(`
                      <center>
                        <div>
                          <img style="height: 40px;" src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif"  />
                        </div>
                      </center>
                    `);
  
                    sessionStore.set('cart_prod_arr', []);
                    sessionStore.set('cart_prod_arr', Cart2);
                    updateShoppingCart_hrml(Cart2);
                    Sdk.getConcepts().then(function (html) {
                      let htmlCart = Sdk.Common().conceptsTableCart(html);
                      $('.skbx-loader-subtotal').hide();
                      $('.international-checkout').html(htmlCart);
                    });
                  });
                // });
              });
            }
          }
          else {
            if (itemsSky.length) {
              Sdk.deleteProductsCart().then(function (res) {
                sessionStore.remove('cart_prod_arr');
              });
            } else {
              sessionStore.remove('cart_prod_arr');
            }
          }
        }
      });
    }).catch(function(error) {
      console.log(':: getLocationAllow error ', error);
    });
  }
}