'use strict';

var cat = require('./lib/cat-client');

module.exports = {
    newTransaction: cat.newTransaction,
    logEvent: cat.logEvent,
    logError: cat.logError
};
