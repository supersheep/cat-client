'use strict';

var util = require('util'),
    escape = require('js-string-escape'),
    time = require('./util/time'),
    logger = require('../logger.js')('transaction'),
    Message = require('./message');

/**
 * Get an instance of a transaction.
 * Transaction is inherited from the message.
 *
 * @param {object} transaction options.
 */
function Transaction(options) {
    Message.call(this, options);
}
util.inherits(Transaction, Message);

/**
 * Format the transaction for sending. A transaction may be one
 * of the following formats.
 * 1. {ATimestamp\tType\tName\tStatus\tDuration\tData\t\n}
 * 2. {tTimestamp\tType\tName\t\n}
 * 3. {TTimestamp\tType\tName\tStatus\tDuration\tData\t\n}
 *
 * @exception {fatal} Unsupported transaction class, do nothing but throw it.
 *
 * @param {string} A or t or T.
 */
Transaction.prototype.toString = function toString(_class) {
    if (_class !== 'A' && _class !== 't' && _class !== 'T') {
        logger.error('Unsupported transaction class ' + _class);
    }

    var classTimeStr = _class;
    var typeStr = this.type;
    var nameStr = this.name;
    var statusStr = '';
    var durationStr = '';
    var dataStr = '';

    if (_class === 'T') {
        classTimeStr += time.date2str(this.endTime);
    } else {
        classTimeStr += time.date2str(this.beginTime);
    }

    if (_class !== 't') {
        statusStr = this.status;
        durationStr = time.durationInMicros(this.beginTime, this.endTime) + 'us';
        dataStr = this.data;
    }

    if (_class === 't') {
        return [classTimeStr, typeStr, nameStr, ''].map(function(elem) {
            return (elem !== undefined && elem !== null) ? escape(elem) : '';
        }).join('\t') + '\n';
    } else {
        return [classTimeStr, typeStr, nameStr, statusStr, durationStr, dataStr, ''].map(function(elem) {
            return (elem !== undefined && elem !== null) ? escape(elem) : '';
        }).join('\t') + '\n';
    }
};

module.exports = Transaction;
