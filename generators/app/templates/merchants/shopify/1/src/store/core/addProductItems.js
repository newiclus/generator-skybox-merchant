function addProductItems(products) {
  var ListProducts = [];

  products.forEach(function (productItem) {
    var prod_id = productItem.id;
    var getWeight = Sdk.calcWeightAndUnit(productItem.grams);

    if (productItem.sku === '') {
      productItem.sku = prod_id;
    };

    if (__cnStore.CONF.PRODUCT_TYPE_DEFAULT !== '') {
      productItem.product_type = __cnStore.CONF.PRODUCT_TYPE_DEFAULT;
    }

    let Product = {
      HtmlObjectid: String(productItem.variant_id),
      Id: String(productItem.variant_id),
      Sku: String(productItem.variant_id),
      Name: productItem.title,
      Category: productItem.product_type,
      Price: (productItem.price / 100),
      ImgUrl: productItem.image,
      Language: "",
      Weight: getWeight.weight,
      WeightUnit: getWeight.unit,
      VolumetricWeight: 0,
      DefinitionOpt: "",
      Quantity: productItem.quantity,
      ProductMerchantId: ""
    }

    ListProducts.push({ "Product": Product });
  });

  return { "ListProducts": ListProducts };
}