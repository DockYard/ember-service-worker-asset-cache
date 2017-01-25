# Ember Service Worker Asset Cache

_An Ember Service Worker plugin that caches an Ember app's asset files_

By default it caches all files in the `assets` folder.

## F#$& my assets aren't updating in development mode

Turn on the "Update on reload" setting in the `Application > Service Workers`
menu in the Chrome devtools.

## Installation

```
ember install ember-service-worker-asset-cache
```

## Configuration

You can configure extra files to include and if your app's file are on a CDN,
you can configure the CDN url.

The configuration is done in the `ember-cli-build.js` file:

```js
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    'asset-cache': {
      // which asset files to include, glob paths are allowed!
      // defaults to `['assets/**/*']`
      include: [
        'assets/admin-engine.js',
        'fonts/font-awesome.*'
      ],

      // which asset files to exclude, glob paths are allowed!
      exclude: [
        '**/*.gif'
      ],

      // changing this version number will bust the cache
      version: '1',

      // if your files are on a CDN, put the url of your CDN here
      // defaults to `fingerprint.prepend`
      prepend: 'https://cdn.example.com/'
    }
  });

  return app.toTree();
};
```

## Authors

* [Marten Schilstra](http://twitter.com/martndemus)

## Versioning

This library follows [Semantic Versioning](http://semver.org)

## Want to help?

Please do! We are always looking to improve this library. Please see our
[Contribution Guidelines](https://github.com/dockyard/ember-service-worker-asset-cache/blob/master/CONTRIBUTING.md)
on how to properly submit issues and pull requests.

## Legal

[DockYard](http://dockyard.com/), Inc. &copy; 2016

[@dockyard](http://twitter.com/dockyard)

[Licensed under the MIT license](http://www.opensource.org/licenses/mit-license.php)
