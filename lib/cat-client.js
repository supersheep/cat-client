'use strict';

var rand = require('random-key'),
    exception = require('./exception'),
    logger = require('./logger'),
    cls = require('./message/util/cls-wrapper'),
    Transaction = require('./message/transaction'),
    Event = require('./message/event'),
    trees = require('./message/org/trees');

/**
 * Generate a new transaction.
 *
 * @param {object} Options to initialize a transaction.
 *   @key {type} Type of transaction. (Default = undefined)
 *   @key {name} Name of transaction. (Default = undefined)
 *   @key {manualSend} Pass true if you want the cat client to decide
 *   when to send the message to the server. (Default = false)
 */
function newTransaction(options) {

    return {
        uid: options.NULL ? 'NULL' : rand.generate(),
        type: options.type,
        name: options.name,
        manualSend: options.manualSend,

        /**
         * Wrap a asynchronous function for transaction monitoring. Beginning
         * of the transaction will automatically done when the wrapped function
         * is called. Unless special demand is met, there is no need to begin
         * the transaction manually.
         *
         * @exception Any error thrown from the lower level, log it.
         *
         * @param {function} The asynchronous function to be wrapped.
         */
        ioTransaction: function ioTransaction(io) {
            if (!(this && this.uid)) {
                return logger.error('Transaction not found, wrap transaction io error.');
            }

            if (this.uid === 'NULL') {
                return io;
            }

            var handler = this;

            return function ioWrapped() {
                var ioThis = this,
                    ioArguments = arguments;

                cls.run(function() {
                    var puid = cls.get();
                    cls.set(handler.uid);

                    try {
                        trees.addMessage(new Transaction({
                            type: handler.type,
                            name: handler.name,
                            manualSend: handler.manualSend
                        }), handler.uid, puid);
                    } catch (err) {
                        if (err instanceof exception.CatError) {
                            logger.error('Wrap transaction io error.', err.message);
                        }
                        if (err instanceof exception.CatFatal) {
                            logger.fatal('Wrap transaction io fatal.', err.message);
                        }

                        logger.error('Wrap transaction io error. Unsupported error caught.', err);
                    }

                    io._handler = handler;
                    trees.beginMessage(handler.uid);
                    return io.apply(ioThis, ioArguments);
                });
            }
        },

        /**
         * Wrap a callback of a synchronous function for transaction monitoring.
         * Ending of a transaction is automatically done when the wrapped function
         * is called. Unless special demand is met, there is no need to end the
         * transaction manually.
         *
         * @exception {error} Transaction not found.
         *
         * @param {function} Callback of a synchronous function to be wrapped.
         */
        cbTransaction: function cbTransaction(cb) {
            if (!(this && this.uid)) {
                return logger.error('Transaction not found. Wrap transaction callback error.');
            }

            if (this.uid === 'NULL') {
                return cb;
            }

            var handler = this;

            return function cbWrapped() {
                handler.endTransaction();
                cb._handler = handler;
                return cb.apply(this, arguments);
            };
        },

        /**
         * Manually begin a transaction.
         *
         * @exception Any exception thrown from the lower level, log it.
         */
        beginTransaction: function beginTransaction() {
            if (!(this && this.uid)) {
                return logger.error('Transaction not found. Begin transaction error.');
            }

            if (this.uid === 'NULL') {
                return;
            }
            var puid = cls.get();
            try {
                // trees.beginMessage(this.uid);
                trees.addMessage(new Transaction({
                    type: this.type,
                    name: this.name,
                    manualSend: this.manualSend
                }), this.uid, puid);
                trees.beginMessage(this.uid);
            } catch (err) {
                if (err instanceof exception.CatError) {
                    logger.error('Begin transaction error.', err.message);
                }
                if (err instanceof exception.CatFatal) {
                    logger.fatal('Begin transaction error.', err.message);
                }

                logger.error('Begin transaction error. Unsupported error caught.', err);
            }
        },

        /**
         * Manually end a transaction.
         *
         * @exception Any exception thrown from the lower level, log it.
         */
        endTransaction: function endTransaction() {
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
                    logger.error('End transaction error.', err.message);
                }
                if (err instanceof exception.CatFatal) {
                    logger.fatal('End transaction fatal.', err.message);
                }

                logger.error('End transaction error. Unsupported error caught.', err);
            }
        },

        /**
         * Set status of a transaction.
         *
         * @exception Any error thrown from the lower level, log it.
         *
         * @param {string} Status, '0' represents success and others represent failure.
         */
        setTransactionStatus: function setTransactionStatus(status) {
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
                    logger.error('Set transaction status error.', err.message);
                }
                if (err instanceof exception.CatFatal) {
                    logger.fatal('Set transaction status fatal.', err.message);
                }

                logger.error('Set transaction error. Unsupported error caught.', err);
            }
        },

        /**
         * Add data to a transaction.
         *
         * @exception Any error thrown from the lower level, log it.
         *
         * @param {string} New data to be appended to the original data.
         */
        addTransactionData: function addTransactionData(data) {
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
                    logger.error('Add transaction data error.', err.message);
                }
                if (err instanceof exception.CatFatal) {
                    logger.fatal('Add transaction data fatal.', err.message);
                }

                logger.error('Unsupported error caught.', err);
            }
        }
    };
}

function getTransaction(fn) {
    if (!fn || !fn._handler) {
        logger.error('Get null transaction in function(%s).', fn.toString());
        return newTransaction({
            NULL: true
        });
    } else {
        return fn._handler;
    }
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
        puid = cls.get();

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
            logger.error('Log event(uid = %d) error.', uid, err.message);
        }

        if (err instanceof exception.CatFatal) {
            logger.fatal('Log event(uid = %d) fatal.', uid, err.message);
        }

        logger.error('Unsupported error caught.', err);
    }
}

module.exports = {
    newTransaction: newTransaction,
    getTransaction: getTransaction,
    logEvent: logEvent
};
