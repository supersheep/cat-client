'use strict';

var cat = global.cat || (function () {
	global.cat = require('./lib/');
	return global.cat;
})();

module.exports = cat;
