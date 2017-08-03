var
  mkdirp = require('mkdirp')
  , through = require('through2').obj
  , fs = require('fs')
  , imagemin = require('imagemin')
  , imageminPngquant = require('imagemin-pngquant')
  , SpritusCssReplacer = require('./css-replacer')
  , prettyBytes = require('pretty-bytes')
;

/**
 * @param {String} cssContent
 * @param {SpritusList} SpritusList
 * @param {Object} config
 * @constructor
 */
var Spritus = function(cssContent, SpritusList, config) {

  this.config = config;

  this.strCSS = cssContent;

  /**
   * @type {SpritusList}
   */
  this.SpritusList = SpritusList;
  this.SpritusList.setSpritus(this);

  this.finishCallback = null;

  this.imgStream = null;

  /**
   * @type {Array}
   */
  this.imgFiles = [];

  this.rootPath = process.cwd() + '/';
};

Spritus.prototype.withImageStream = function(imgStream) {
  this.imgStream = imgStream;
};

Spritus.prototype.replace = function(finishCallback) {
  this.finishCallback = finishCallback;
  this.SpritusList.run(this.runHandler.bind(this));
};

Spritus.prototype.saveTo = function(filepath) {

  if (filepath.indexOf('/') !== 0) {
    filepath = this.rootPath = filepath;
  }

  this.replace(function(cssContent) {
    fs.unlink(filepath, function(err) {
      if (err) {
      }

      fs.writeFile(filepath, cssContent, function(err) {
        if (err) throw err;
      });

    });
  });

};

Spritus.prototype._saveFile = function(file, path, fromImagemin) {
  var filepath = path + file.path;

  fs.unlink(filepath, function(err) {
    if (err) {
    }

    fs.writeFile(filepath, file.contents, function(err) {
      if (err) throw err;

      if (!fromImagemin) {
        console.log('spritus[save file]: ' + path + file.path);
      }
    });

  });
};

Spritus.prototype._saveImagemin = function(file, path) {

  var self = this;

  imagemin.buffer(file.contents, {
    plugins: this.config.withImageminPlugins ? this.config.withImageminPlugins : [
      imageminPngquant({
        quality: '60-70',
        speed: 1
      })
    ]
  })
    .then(function(data) {

      var originalSize = file.contents.length;
      var optimizedSize = data.length;
      var saved = originalSize - optimizedSize;
      var percent = (originalSize > 0 ? (saved / originalSize) * 100 : 0).toFixed(1).replace(/\.0$/, '');
      var msg = saved > 0 ? '- saved ' + prettyBytes(saved) + ' (' + percent + '%)' : ' -';
      console.log('spritus[imagemin]: ' + path + file.path + ' ' + msg);

      file.contents = data;

      self._saveFile(file, path, true);
    })
    .catch(function(err) {
      console.log('imagemin: ' + file.path + ' Error');
      console.log(err);
    });
};

Spritus.prototype.runHandler = function(imgFile) {

  this.imgFiles.push(imgFile);

  if (!this.SpritusList.isComplete()) return;

  this.strCSS = SpritusCssReplacer.makeCSS(this.strCSS, this.SpritusList, this.config.searchPrefix);

  var i, l, path;

  if (!this.config.saveImage) {
    if (this.imgStream) {
      for (i = 0, l = this.imgFiles.length; i < l; ++i) {
        this.imgStream.push(this.imgFiles[i]);
      }
    }
  } else {
    path = this.config.imageDirSave.indexOf('/') === 0 ? this.config.imageDirSave : this.rootPath + this.config.imageDirSave;
    var self = this;
    mkdirp(path, function(err) {
      if (err) {
        console.log(err);
        return;
      }

      var i, l;
      if (!self.config.withImagemin) {
        for (i = 0, l = self.imgFiles.length; i < l; ++i) {
          self._saveFile(self.imgFiles[i], path);
        }
      } else {
        for (i = 0, l = self.imgFiles.length; i < l; ++i) {
          self._saveImagemin(self.imgFiles[i], path);
        }
      }

    });

  }

  if (this.finishCallback) {
    this.finishCallback(this.strCSS, this);
  }
};

module.exports = Spritus;