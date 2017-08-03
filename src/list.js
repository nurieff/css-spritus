var SpritusModel = require('./model');

/**
 * @constructor
 */
var SpritusList = function () {

  this.length = 0;
  this.amountComplete = 0;

    /**
     * @type {Spritus}
     */
  this.spritus = null;

  /**
   * @type {Object.<String,SpritusModel>}
   */
  this.list = {};
};

/**
 *
 * @param {Spritus} spritus
 */
SpritusList.prototype.setSpritus = function (spritus) {
  this.spritus = spritus;
};

/**
 * @param str
 * @return {SpritusModel}
 */
SpritusList.prototype.push = function (str) {
  if (str in this.list) {
    return this.list[str];
  }

  this.length += 1;

  return this.list[str] = new SpritusModel(this, str);
};

/**
 * @param str
 * @return {SpritusModel|null}
 */
SpritusList.prototype.get = function (str) {
  if (str in this.list) {
    return this.list[str];
  }

  return null;
};

SpritusList.prototype.incrementComplete = function () {
  ++this.amountComplete;
};

SpritusList.prototype.isComplete = function () {
  return this.length == this.amountComplete;
};

SpritusList.prototype.each = function (cb) {
  for (var str in this.list) {
    if (!this.list.hasOwnProperty(str)) continue;

    cb.call(null, this.list[str]);
  }
};

SpritusList.prototype.run = function (cb) {
  this.each(function (_spritus) {
    _spritus.run(cb)
  });
};

module.exports = SpritusList;