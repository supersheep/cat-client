var Cat = require("./cat");
var middleware = require("./middleware");
var logger = require("./logger")("index");
var config = require("./config");
var system = require("./system");
/**
 * exports 一个默认Cat的实例 , 方便直接使用
 * */
module.exports = new Cat.CatClass();

module.exports.Cat = Cat.CatClass;

module.exports.init = function (options) {
    options = options || {};

    if (options.appName) {
        config.setDomain(options.appName);
        logger.info("Set AppName " + options.appName);
    }

    system.collectSysInfo();

};

module.exports.middleware = middleware;