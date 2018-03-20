const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const conf = require('./config/store.json');

const plataforma = conf.MOD_PLATAFORM;
let nameFile = plataforma.toLocaleLowerCase().trim() + '.' + conf.STORE_HASH + '.' + conf.IDSTORE;

module.exports = merge(common, {
  plugins: [
    new UglifyJsPlugin()
  ],
  output: {
    filename: nameFile + '.min.js',
    path: path.resolve(__dirname, 'dist')
  }
});