function validate2(cart) {
  var arraySky = cart.Data.Cart.Items,
      arrayErrors = [],
    
  arrayErrors = _.filter(arraySky, function(prod) { 
    return prod.IsRestricted; 
  });

  if (arrayErrors.length > 0) {
    api.get('/cart.js').then(function (data) {
      console.log('hereeee');
    });
  }
}