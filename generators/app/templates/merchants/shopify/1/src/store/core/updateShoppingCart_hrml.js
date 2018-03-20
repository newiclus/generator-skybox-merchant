function updateShoppingCart_hrml(carts) {
  if (carts && Object.keys(carts).length > 0) {
    var Data = carts.Data;
    var Cart = Data.Cart;
    var Items = Cart.Items.reverse();    

    for (let i = 0; i < Items.length; i++) {
      let idProductStore = Items[i].Code;
      let d = Data;
      let CartCurrencyIso = d.Cart.Currency;
      let skbx_quantity_product = Items[i].Quantity;

      let storeProductPrice = Items[i].Price.toString();  
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

      $('.sky--Price-' + idProductStore).html(CartCurrencyIso + ' ' + storeProductPrice);
      $('.sky--Total-' + idProductStore).html(CartCurrencyIso + ' ' + skbx_total_product);
      console.log(idProductStore + ' - ' + CartCurrencyIso + ' ' + storeProductPrice)
      hideLoaderds(idProductStore);
    }
  } else {
    $("[class*=skbx-loader]").hide();
  }
}