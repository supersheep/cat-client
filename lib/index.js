var Cat = require("./cat");
var logger = require("./logger")("index");
/**
 * exports 一个默认Cat的实例 , 方便直接使用
 * */
module.exports = new Cat.CatClass();

module.exports.STATUS = Cat.STATUS;

module.exports.Cat = Cat.CatClass;

module.exports.init = function (options) {
    options = options || {};

    if (options.appName) {
        config.setDomain(options.appName);
        logger.info("Set AppName " + options.appName);
    }
};