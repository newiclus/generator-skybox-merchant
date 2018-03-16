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
    this.fs.copy(
      this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt')
    );
  }

  install() {
    this.installDependencies();
  }
};
