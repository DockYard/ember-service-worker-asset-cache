/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-service-worker-asset-cache',

  included: function(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;
    this.app.options = this.app.options || {};
    this.app.options.fingerprint = this.app.options.fingerprint || {};
    this.app.options.fingerprint.generateAssetMap = true;
  },
};
