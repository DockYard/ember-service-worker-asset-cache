/* jshint node: true */
'use strict';

var AssetMap = require('./lib/asset-map');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-service-worker-asset-cache',

  included: function(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;
    this.app.options = this.app.options || {};
    this.app.options['service-worker-caching'] = this.app.options['service-worker-caching'] || {};

    this.app.options['service-worker-caching'].appName =
        this.app.name || this.app.options['service-worker-caching'].appName;

    if (this.app.options.fingerprint && this.app.options.fingerprint.enabled) {
      this.app.options['service-worker-caching'].prepend = this.app.options.fingerprint.prepend;
    }
  },

  treeForServiceWorker(swTree, appTree) {
    var options = this.app.options['service-worker-caching'];
    var assetMapFile = new AssetMap([appTree], options);

    return mergeTrees([swTree, assetMapFile]);
  }
};
