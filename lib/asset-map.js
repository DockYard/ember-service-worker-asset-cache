var Filter = require('broccoli-filter');
var fs = require('fs');
var path = require('path');
var glob = require('glob');

// Create a subclass AssetMap derived from Filter
AssetMap.prototype = Object.create(Filter.prototype);
AssetMap.prototype.constructor = AssetMap;
function AssetMap(inputNodes, options) {
  if (!(this instanceof AssetMap)) {
    return new AssetMap(inputNodes, options);
  }

  options = options || {};

  Filter.call(this, inputNodes, {
    annotation: options.annotation
  });

  this.options = options;
}

AssetMap.prototype.getDestFilePath = function() {
  return false;
};

AssetMap.prototype.writeAssetMap = function() {
  var files = [];

  var isAppAsset = new RegExp('^' + this.options.appName + '(?:-[\\da-f]{32})?.(?:js|css)$');
  var isVendorAsset = new RegExp('^vendor(?:-[\\da-f]{32})?.(?:js|css)$');

  this.inputPaths.forEach(function(inputPath) {
    var assetPath = inputPath + '/assets'

    if (fs.existsSync(assetPath)) {
      fs.readdirSync(assetPath).forEach(function(file) {
        if (isAppAsset.test(file) || isVendorAsset.test(file)) {
          files.push('assets/' + file);
        }
      });
    }
  });

  if (this.options.includes) {
    var options = this.options;
    this.inputPaths.forEach(function(path) {
      options.includes.forEach(function(include) {
        glob.sync(include, { cwd: path }).forEach(function(file) {
          if (files.indexOf(file) === -1) {
            files.push(file);
          }
        });
      });
    });
  }

  var data = { files: files };

  if (this.options.prepend) {
    data.prepend = this.options.prepend;
  }

  safeWrite(path.join(this.outputPath, 'files.json'), JSON.stringify(data));
};

AssetMap.prototype.build = function() {
  var self = this;

  return Filter.prototype.build.call(this).then(function() {
    self.writeAssetMap();
  });
};

var safeWrite = function(file, contents){
  var dir = path.dirname(file);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(file, contents);
};

module.exports = AssetMap;
