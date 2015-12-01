'use strict';

var escape = require('js-string-escape');
var time = require('./util/time');
var logger = require('../logger.js')('transaction');
var Message = require('./message');
var logLine = require("./util/logline");

/**
 * Get an instance of a transaction.
 * Transaction is inherited from the message.
 *
 * @param {object} options.
 */
class Transaction extends Message {
    constructor(options) {
        super(options);
    }


    /**
     * Format the transaction for sending. A transaction may be one
     * of the following formats.
     * 1. {ATimestamp\tType\tName\tStatus\tDuration\tData\t\n}
     * 2. {tTimestamp\tType\tName\t\n}
     * 3. {TTimestamp\tType\tName\tStatus\tDuration\tData\t\n}
     *
     * @exception {fatal} Unsupported transaction class, do nothing but throw it.
     *
     * @param {string} _class : A or t or T.
     */


    toBuffer(_class) {
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
            return logLine([classTimeStr, typeStr, nameStr, '']);
        } else {
            return  logLine([classTimeStr, typeStr, nameStr, statusStr, durationStr, dataStr, '']);
        }

    }
}


module.exports = Transaction;
