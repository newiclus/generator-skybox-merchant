'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`
        Welcome to the stupendous ${chalk.red('generator-skybox-merchant')} generator!
      `)
    );

    const prompts = [
      {
        type: 'checkbox',
        name: 'merchant',
        message: 'Choose the Merchant',
        choices: [
          {
            name: 'Shopify',
            checked: true
          },
          {
            name: '3dCart'
          },
          {
            name: 'BigCommerce'
          }
        ],
        validate: function(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one merchant.';
          }
          return true;
        },
        filter: function(val) {
          return val.toLowerCase();
        }
      },
      {
        type: 'checkbox',
        name: 'integration',
        message: 'Choose the type of integration',
        choices: [
          {
            name: '1',
            checked: true
          },
          {
            name: '3'
          }
        ],
        validate: function(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one.';
          }
          return true;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const platform = this.props.merchant;
    const integration = this.props.integration;
    var itype = '1';

    if (integration === 3) {
      itype = '3';
    }

    // Merchant
    if (platform === '3dcart') {
      this.fs.copy(
        this.templatePath('merchants/3dcart/' + itype + '/src'),
        this.destinationPath('./src')
      );
      this.fs.copy(
        this.templatePath('general/assets/css/3dCart.css'),
        this.destinationPath('./assets/css/3dcart.css')
      );
    }
    if (platform === 'bigcommerce') {
      this.fs.copy(
        this.templatePath('merchants/bigcommerce/' + itype + '/src'),
        this.destinationPath('./src')
      );
      this.fs.copy(
        this.templatePath('general/assets/css/bigCommerce.css'),
        this.destinationPath('./assets/css/bigCommerce.css')
      );
    }
    if (platform === 'shopify') {
      this.fs.copy(
        this.templatePath('merchants/shopify/' + itype + '/src'),
        this.destinationPath('./src')
      );
      this.fs.copy(
        this.templatePath('general/assets/css/shopify.css'),
        this.destinationPath('./assets/css/shopify.css')
      );
    }

    // Package.json
    this.fs.copyTpl(
      this.templatePath('general/package.json'),
      this.destinationPath('./package.json'),
      {
        merchant: platform,
        typeIntegration: integration
      }
    );

    // Webpack
    this.fs.copy(
      this.templatePath('general/webpack.common.js'),
      this.destinationPath('./webpack.common.js')
    );
    this.fs.copy(
      this.templatePath('general/webpack.dev.js'),
      this.destinationPath('./webpack.dev.js')
    );
    this.fs.copy(
      this.templatePath('general/webpack.prod.js'),
      this.destinationPath('./webpack.prod.js')
    );

    // Git
    this.fs.copy(
      this.templatePath('general/.gitignore'),
      this.destinationPath('./.gitignore')
    );

    // Readme
    this.fs.copy(
      this.templatePath('general/README.md'),
      this.destinationPath('./README.md')
    );

    // Assets
    this.fs.copy(
      this.templatePath('general/assets/img'),
      this.destinationPath('./assets/img')
    );

    // Config
    this.fs.copy(this.templatePath('general/config'), this.destinationPath('./config'));

    // Dist
    this.fs.copy(this.templatePath('general/dist'), this.destinationPath('./dist'));

    // Src/xhr.js
    this.fs.copy(
      this.templatePath('general/src/xhr.js'),
      this.destinationPath('./src/xhr.js')
    );
  }

  install() {
    this.installDependencies();
  }
};
