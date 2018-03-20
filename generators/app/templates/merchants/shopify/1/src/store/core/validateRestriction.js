function validateRestriction(cart) {
  var arraySky = cart.Data.Cart.Items,
      arrayErrors = [],
    
  arrayErrors = _.filter(arraySky, function(prod) { 
    return prod.IsRestricted; 
  });

  if (arrayErrors.length > 0) {
    api.get('/cart.js').then(function (data) {
      var arrayStore = JSON.parse((data.responseText)).items,
          clonedArrStore = arrayStore,
          operations = [],
          operations2 = [],
          html = '';

      var auth_store = sessionStore.get('auth-store'),
        country = 'your country';
      
      if (!_.isUndefined(auth_store) && !_.isNull(auth_store)) {
        country = (auth_store.Data.CART_SKY.Country.Name).toUpperCase().trim();
      }

      html += '<div>';
      html += '<br />';
      html += ' <p>' + 'The following products will be removed from your shopping cart, they are' + '<strong>' + ' restricted in ' + country + '</strong>';
      html += ' <table>';
      html += '   <tbody>';

      arrayErrors.map((item) => {
        for (var i in clonedArrStore) {
          var objStore = clonedArrStore[i],
            code = objStore.variant_id ? String(objStore.variant_id) : String(objStore.id);

          if ((item.Code).trim() === (code).trim()) {
            html += '     <tr>';
            html += '       <td>';
            html += '         <center><img style="height: 150px;" src="' + objStore.image + '"</img>' + '</center>';
            html += '       </td>';
            html += '       <td>';
            html += '         <strong> <p>' + objStore.title + '</p>' + '</strong>' + '<br />';
            html += '       </td>';
            html += '     </tr>';

            clonedArrStore.splice(parseInt(i), 1);

            var line = parseInt(i) + 1;
            var url = __cnStore.STORE_URL + '/cart/change' + '?line=' + line + '&quantity=' + 0;
            // operations.push(api.post(url));
            operations.push(
              $.ajax({
                url: url,
                dataType: 'json',
                cache: false
              })  
            );
            operations.push(Sdk.removeProductCart(item.Id));
            console.log(url);
            // api.get(url);
            break;
          }
        } 
      });
      
      html += '   </tbody>';
      html += ' </table>';
      html += '</div>';

      Promise.all(operations).then(function() {
        if (operations.length > 0) {
          $('.header-cart-btn').prop('disabled', true);

          var modal = new tingle.modal({
            footer: true,
            stickyFooter: true,
            closeMethods: ['overlay', 'button', 'escape'],
            closeLabel: "Close",
            onClose: function() {
              top.location.reload();
            }
          });

          modal.addFooterBtn('Close', 'tingle-btn tingle-btn--default tingle-btn--pull-right', function() {
            modal.close();
          });
    
          modal.setContent(html);
          modal.open();
              
          Sdk.getCartRefresh().then(function (data) {
            sessionStore.set('cart_prod_arr', []);
            sessionStore.set('cart_prod_arr', data);
            $('.header-cart-btn').prop('disabled', false);
          });  
        }
      });
    });
  }
}