var fs = require('fs');
var Spritus = require('./src/spritus.js');
var SpritusList = require('./src/list.js');

var findInPath = function(path, config) {

  if (path.indexOf('/') !== 0) {
    path = process.cwd() + '/' + path;
  }

  var cssContent = fs.readFileSync(path).toString();

  return findInContent(cssContent, config);
};

var findInContent = function(cssContent, _config) {

  var config = {
    padding: 2,
    algorithm: 'top-down', // left-right,diagonal,alt-diagonal,binary-tree
    searchPrefix: 'spritus',
    saveImage: true,
    withImagemin: true,
    withImageminPlugins: null,
    imageDirCSS: '../images/',
    imageDirSave: 'public/images/'
  };

  if (_config) {
    for (var key in _config) {
      if (!_config.hasOwnProperty(key)) continue;

      if (key in config) {
        config[key] = _config[key];
      }
    }
  }

  var SL = new SpritusList();
  var S = new Spritus(cssContent, SL, config);

  var find = false;

  cssContent.replace(new RegExp(config.searchPrefix + "[\\-\\:]{1}([^\\(]+)\\(\\\"([^\\\"]+)\\\"(\\)|,\\s*?\\\"([^\\)\\\"]*)\\\")", 'ig'), function(str) {
    var sprite = arguments[2];
    var method = arguments[1];
    var arg = arguments[4] ? arguments[4] : null;

    /**
     * @type {SpritusModel}
     */
    var sModel = SL.push(sprite);

    if (method.indexOf('each') !== -1) {
      sModel.isFull();
    } else if (arg) {
      sModel.used(arg);
    }

    find = true;
    return str;
  });

  return find ? S : null;
};

module.exports = {
  findInContent: findInContent,
  findInPath: findInPath
};