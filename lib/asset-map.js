var Filter = require('broccoli-filter');
var fs = require('fs');
var path = require('path');

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

AssetMap.prototype.build = function() {
  var self = this;

  var filePaths = [];
  this.inputPaths.forEach(function(path) {
    filePaths = filePaths.concat(walkSync(path));
  });

  var data = { files: filePaths };
  if (this.options && this.options.prepend) {
    data.prepend = this.options.prepend;
  }

  fs.writeFileSync(path.join(this.outputPath, 'files.json'), JSON.stringify(data));

  return Filter.prototype.build.call(this);
};

var walkSync = function(baseDir, dir, filelist) {
  var fullDir = dir ? path.join(baseDir, dir): baseDir;
  var files = fs.readdirSync(fullDir);
  filelist = filelist || [];

  files.forEach(function(file) {
    var filePath = (dir ? dir + '/' : '') + file;
    if (fs.statSync(fullDir + '/' + file).isDirectory()) {
      filelist = walkSync(baseDir, filePath, filelist);
    } else {
      filelist.push(filePath);
    }
  });

  return filelist;
};

module.exports = AssetMap;
