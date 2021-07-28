'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = class AssetMap extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, {
      name: options && options.name,
      annotation: options && options.annotation
    });

    this.options = options;
  }

  build() {
    let options = this.options; // options from 'asset-cache' config
    let includes = options.include || ['assets/**/**/*'];
    let excludes = options.exclude || [];
    let manual = options.manual || [];
    let version = options.version;
    let requestMode = options.requestMode || 'cors';

    let includedFiles = this._findFiles(includes);
    let excludedFiles = this._findFiles(excludes);

    let module = '';
    module += `import { VERSION as VERSION_FROM_STRATEGY } from 'ember-service-worker/service-worker';\n`;
    let files = includedFiles.reduce((files, file) => {
      return (excludedFiles.indexOf(file) !== -1) ? files : files.concat(file);
    }, []);

    manual.forEach((manualFile) => {
      if (files.indexOf(manualFile === -1)) {
        files.push(manualFile);
      }
    });

    if (files.length > 0) {
      module += `export const FILES = ['${files.join("', '")}'];\n`;
    } else {
      module += 'export const FILES = [];\n';
    }

    if (options.prepend) {
      module += `export const PREPEND = '${options.prepend}';\n`;
    } else {
      module += 'export const PREPEND = undefined;\n';
    }

    if (version) {
      module += `export const VERSION = '${version}';\n`;
    }
    else {
      module += `export const VERSION = VERSION_FROM_STRATEGY;\n`;
    }
    module += `export const REQUEST_MODE = '${requestMode}';\n`;
    module += `export const LENIENT_ERRORS = ${options.lenientErrors || false};\n`;

    fs.writeFileSync(path.join(this.outputPath, 'config.js'), module);
  }

  _findFiles(fileGlobs) {
    let files = [];

    this.inputPaths.forEach((path) => {
      fileGlobs.forEach((fileGlob) => {
        glob.sync(fileGlob, { cwd: path, nodir: true }).forEach((file) => {
          if (files.indexOf(file) === -1) {
            files.push(file);
          }
        });
      });
    });

    return files;
  }
};
