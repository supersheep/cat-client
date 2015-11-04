'use strict';

var cat = global.cat || (function () {
	global.cat = require('./lib/cat-client');
	return global.cat;
})();

module.exports = cat;
