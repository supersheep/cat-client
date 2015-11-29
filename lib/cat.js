'use strict';

var rand = require('random-key');
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
    }

    logEvent(type, name, status, data) {
        this.treeManager.addMessage(new CatEvent({
            type: type,
            name: name,
            status: status,
            data: data
        }));
    }

    logError(name, error) {
        if (name instanceof  Error) {
            error = name;
            name = null;
        }

        name = name || error && error.name;

        this.logEvent("Error", name, "ERROR", name ? name + " " + error.stack : error.stack);
    }

    newTransaction(type, name) {
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


        return t;
    }
}

exports.CatClass = Cat;
exports.STATUS = STATUS;