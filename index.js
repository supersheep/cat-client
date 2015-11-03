'use strict';

var cat = global.cat || (function () {
	global.cat = require('./lib/cat-client');
	return global.cat;
})();

module.exports = {
    newTransaction: cat.newTransaction,
    logEvent: cat.logEvent,
    logError: cat.logError
};
