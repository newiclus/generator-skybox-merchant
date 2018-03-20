function getRestrictedElems(arraySky, arrayStore) {
  var clonedArrStore = arrayStore,
      operations = [],
      html = '';

  if (_.isArray(arraySky) && arraySky.length > 0) {
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

    var arrayElementsCar = $('.cart-row');

    arraySky.map((item) => {
      if (!item.Success) {
        for (var i in clonedArrStore) {
          var objStore = clonedArrStore[i],
              code = objStore.variant_id ? String(objStore.variant_id) : String(objStore.id);
          
          if ((item.HtmlObjectId).trim() === (code).trim()) {
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

            console.log(url);

            html += '     <tr>';
            html += '       <td>';
            html += '         <center><img style="height: 150px;" src="' + objStore.image + '"</img>' + '</center>';
            html += '       </td>';
            html += '       <td>';
            html += '         <strong> <p>' + objStore.title + '</p>' + '</strong>' + '<br />';
            html += '       </td>';
            html += '     </tr>';

            clonedArrStore.splice(parseInt(i), 1);
            break;
          }
        }
      }
    });

    html += '   </tbody>';
    html += ' </table>';
    html += '</div>';
  }

  return {
    operations: operations,
    html: html
  }
}