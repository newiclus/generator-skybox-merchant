const path = require('path');
const webpack = require('webpack');
const conf = require('./config/store.json');

const plataforma = conf.MOD_PLATAFORM;
let entryPoint = '';

console.log('COMPILANDO A PLATAFORMA:::', plataforma);
if (plataforma.length > 0) {
  if (plataforma.toLocaleUpperCase().trim() === '3DCART')
    entryPoint = './src/entryPoint/3dcart.js';
  else if (plataforma.toLocaleUpperCase().trim() === 'BIGCOMMERCE')
    entryPoint = './src/entryPoint/bigcommerce.js';
  else if (plataforma.toLocaleUpperCase().trim() === 'SHOPIFY')
    entryPoint = './src/entryPoint/shopify.js';

  let nameFile = plataforma.toLocaleLowerCase().trim() + '.' + conf.STORE_HASH + '.' + conf.IDSTORE;

  module.exports = {
    entry: {
      sky: entryPoint,
    },
    plugins: [      
      new webpack.ProvidePlugin({
        'jQuery': 'jquery',
        'window.jQuery': 'jquery',
        'jquery': 'jquery',
        'window.jquery': 'jquery',
        '$': 'jquery',
        'window.$': 'jquery',
        underscore:'underscore'
      })
    ],
    module: {
      rules: [
        {
          use: {
            loader:'babel-loader',
            options: { presets: ['es2015'] }
          },
          test: /\.js$/,
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader'
          ]
        }
      ]
    },
    output: {
      filename: nameFile + '.js',
      path: path.resolve(__dirname, 'dist')
    }
  };
}
else{
  console.log(':::INGRESE PLATAFORMA EN ARCHIVOS DE CONFIGURACION A PLATAFORMA:::');
}
