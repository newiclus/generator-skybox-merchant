'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-skybox-merchant:app', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../generators/app'))
      .withPrompts({ merchant: 'Shopify', integration: '1' });
  });

  it('creates files', () => {
    assert.file(['package.json']);
  });
});
