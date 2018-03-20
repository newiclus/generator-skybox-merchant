function searchVariant(currentCode, isModal) {
  var classInternationalPrice = ".internationalPrice";

  if (isModal) {
    classInternationalPrice = ".js-quick-shop .internationalPrice";
  }
  
  $(classInternationalPrice).each((i, element) => {
    var product = JSON.parse(element.getAttribute('data'));

    product.variants.forEach(function (el, a) {
      var variantCode = el.id;
      if (variantCode == currentCode) {
        if (!isModal) {
          var padre = $(element).parent();
          padre.find("div:first-child").addClass('skbx-loader-' + currentCode);
        } else {
          var imgLoad = '<img style="height: 30px;" src="https://s3.amazonaws.com/sky-sbc-images/WebApp/SBC/Images/loader.gif">';
          $(element).html(imgLoad);
        }
        element.setAttribute('id','skybox-product-price-' + currentCode);
        element.setAttribute('data-variant-id', currentCode);
        product.variants.splice(a, 1);
        product.variants.unshift(el);
        product = JSON.stringify(product);
        element.setAttribute('data', product);

        multipleCalculate([element]);
        return false;
      }
    });
  })      
}