'use strict';

var logger;

try {
	logger = log;
} catch (err) {
	logger = function(msg) {
	    console.log(msg);
	}
}

module.exports = {
    error: logger,
    fatal: logger,
    info: logger,
    warn: logger
}
