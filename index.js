'use strict';

var cat = require('./lib/cat-client');

module.exports = {
    newTransaction: cat.newTransaction,
    getTransaction: cat.getTransaction,
    logEvent: cat.logEvent
};
