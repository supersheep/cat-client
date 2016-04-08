'use strict';

var logger = require('./logger.js')('cat-client');
var Transaction = require('./message/transaction');
var CatEvent = require('./message/event');
var TreeManager = require('./message/org/tree-manager');

const STATUS = {
    SUCCESS: "0",
    FAIL: "1"
};


/**
 * Class Cat
 * @param ctx KOA request context
 *
 * NOTE:不要添加叫init的方法， 具体看 ./index.js
 * */

class Cat {

    constructor(ctx) {
        this.ctx = ctx;
        this.treeManager = new TreeManager();
        this.STATUS = STATUS;
    }

    logEvent(type, name, status, data) {
        this.treeManager.addMessage(createEvent(type, name, status, data));
    }

    logError(name, error) {
        this.treeManager.addMessage(createError(name, error));
    }

    newTransaction(type, name) {
        var self = this;
        var t = {};
        t.type = type;
        t.name = name;
        var treeManager = this.treeManager;

        var message = new Transaction({
            type: t.type,
            name: t.name
        });
        treeManager.addMessage(message);

        /**
         * Manually end a transaction.
         *
         * @exception Any exception thrown from the lower level, log it.
         */
        t.complete = function () {
            treeManager.endMessage(message);
        };

        /**
         * Set status of a transaction.
         *
         * @exception Any error thrown from the lower level, log it.
         *
         * @param {string} status , see STATUS.
         */
        t.setStatus = function (status) {
            message.status = "" + status;
        };

        /**
         * Add data to a transaction.
         *
         * @exception Any error thrown from the lower level, log it.
         *
         * @param {string} data ,  New data to be appended to the original data.
         */
        t.addData = function (data) {
            message.data = data;
        };

        /**
         * logEvent , same as cat.logEvent , but ensures adding to this transaction
         * */
        t.logEvent = function (type, name, status, data) {
            if (message.isEnd) {
                return self.logEvent(type, name, status, data);
            } else {
                message.addChild(createEvent(type, name, status, data));
            }
        };
        /**
         * logError , same as cat.logError , but ensures adding to this transaction
         * */
        t.logError = function (name, error) {
            if (message.isEnd) {
                return self.logError(name, error);
            } else {
                message.addChild(createError(name, error));
            }
        };

        return t;
    }
}

function createEvent(type, name, status, data) {
    return new CatEvent({
        type: type,
        name: name,
        status: status || STATUS.SUCCESS,
        data: data
    });
}
function createError(name, error) {
    if (name instanceof Error) {
        error = name;
        name = null;
    }

    name = name || (error && error.name) || "Error";
    var stack = error ? error.stack : "";
    return createEvent("Error", name, "ERROR", name ? name + " " + stack : stack);
}

exports.CatClass = Cat;