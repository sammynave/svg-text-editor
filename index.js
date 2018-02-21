'use strict';

module.exports = {
  name: 'svg-text-editor',
  included(app) {
    app.import('node_modules/d3/d3.js');
    app.import('node_modules/d3plus/d3plus.js');
  }
};
