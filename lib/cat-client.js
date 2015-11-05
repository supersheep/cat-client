'use strict';

var rand = require('random-key'),
    exception = require('./exception'),
    logger = require('@dp/logger-container')('cat-client[cat-client]'),
    Puid = require('./message/util/puid'),
    Transaction = require('./message/transaction'),
    Event = require('./message/event'),
    trees = require('./message/org/trees');

/**
 * Generate a new transaction.
 *
 * @param {object} Options to initialize a transaction.
 *   @key {type} Type of transaction. (Default = undefined)
 *   @key {name} Name of transaction. (Default = undefined)
 */
function newTransaction(options) {
    var t = {};
    t.uid = options.NULL ? 'NULL' : rand.generate();
    t.type = options.type;
    t.name = options.name;

    /**
     * Manually end a transaction.
     *
     * @exception Any exception thrown from the lower level, log it.
     */
    t.complete = function() {
        if (!(this && this.uid)) {
            return logger.error('Transaction not found. End transaction error.');
        }

        if (this.uid === 'NULL') {
            return;
        }

        try {
            trees.endMessage(this.uid);
        } catch (err) {
            if (err instanceof exception.CatError) {
                logger.error('End transaction error. ' + err.message);
            }
            if (err instanceof exception.CatFatal) {
                logger.error('End transaction fatal. ' + err.message);
            }

            logger.error('End transaction error. Unsupported error caught. ' + err);
        }
        Puid.unset();
    };

    /**
     * Set status of a transaction.
     *
     * @exception Any error thrown from the lower level, log it.
     *
     * @param {string} Status, '0' represents success and others represent failure.
     */
    t.setStatus = function(status) {
        if (!(this && this.uid)) {
            return logger.error('Transaction not found. Set transaction status error.');
        }

        if (this.uid === 'NULL') {
            return;
        }

        try {
            trees.addMessageOptions(this.uid, {
                status: status
            });
        } catch (err) {
            if (err instanceof exception.CatError) {
                logger.error('Set transaction status error. ' + err.message);
            }
            if (err instanceof exception.CatFatal) {
                logger.error('Set transaction status fatal. ' + err.message);
            }

            logger.error('Set transaction error. Unsupported error caught. ' + err);
        }
    };

    /**
     * Add data to a transaction.
     *
     * @exception Any error thrown from the lower level, log it.
     *
     * @param {string} New data to be appended to the original data.
     */
    t.addData = function(data) {
        if (!(this && this.uid)) {
            return logger.error('Transaction not found. Add transaction data error.');
        }

        if (this.uid === 'NULL') {
            return;
        }

        try {
            trees.addMessageOptions(this.uid, {
                data: data
            });
        } catch (err) {
            if (err instanceof exception.CatError) {
                logger.error('Add transaction data error. ' + err.message);
            }
            if (err instanceof exception.CatFatal) {
                logger.error('Add transaction data fatal. ' + err.message);
            }

            logger.error('Unsupported error caught. ' + err);
        }
    };

    var puid = Puid.get();
    Puid.set(t.uid);

    try {
        trees.addMessage(new Transaction({
            type: t.type,
            name: t.name
        }), t.uid, puid);
        trees.beginMessage(t.uid);
    } catch (err) {
        if (err instanceof exception.CatError) {
            logger.error('Begin transaction error. ' + err.message);
        }
        if (err instanceof exception.CatFatal) {
            logger.error('Begin transaction error. ' + err.message);
        }

        logger.error('Begin transaction error. Unsupported error caught. ' + err);
    }

    return t;
}

/**
 * Generate a new event.
 *
 * @exception Any error thrown from the lower level, log it.
 *
 * @param {object} Options to initialize an event.
 *   @key {type} Type of event. (Default = undefined)
 *   @key {name} Type of event. (Default = undefined)
 *   @key {status} Status of event. (Default = undefined)
 *   @key {data} Data of event. (Default = undefined)
 */
function logEvent(options) {
    var uid = rand.generate(),
        puid = Puid.get();

    try {
        trees.addMessage(new Event({
            type: options.type,
            name: options.name,
            status: options.status,
            data: options.data
        }), uid, puid);

        // If the new event is at the top level. Send it to
        // the server immediately.
        if (!puid) {
            trees.sendTree(uid);
        }
    } catch (err) {
        if (err instanceof exception.CatError) {
            logger.error('Log event(uid = ' + uid + ') error. ' + err.message);
        }

        if (err instanceof exception.CatFatal) {
            logger.error('Log event(uid = ' + uid + ') fatal. ' + err.message);
        }

        logger.error('Unsupported error caught. ' + err);
    }
}

/**
 * Generate a new error.
 *
 * @exception Any error thrown from the lower level, log it.
 *
 * @param {object} Options to initialize an error.
 *   @key {msg} Message of error. (Default = undefined)
 *   @key {cause} Stack of error. (Default = undefined)
 */
function logError(options) {
    var uid = rand.generate(),
        puid = Puid.get(),
        name = options.cause && options.cause.name,
        msg = options.msg ? options.msg + '  ' : '';

    try {
        trees.addMessage(new Event({
            type: 'Error',
            name: name,
            status: 'ERROR',
            data: msg + options.cause
        }), uid, puid);

        // If the new error is at the top level. Send it to
        // the server immediately.
        if (!puid) {
            trees.sendTree(uid);
        }
    } catch (err) {
        if (err instanceof exception.CatError) {
            logger.error('Log error(uid = ' + uid + ') error. ' + err.message);
        }

        if (err instanceof exception.CatFatal) {
            logger.error('Log error(uid = ' + uid + ') fatal. ' + err.message);
        }

        logger.error('Unsupported error caught. ' + err);
    }
}

module.exports = {
    newTransaction: newTransaction,
    logEvent: logEvent,
    logError: logError
};
