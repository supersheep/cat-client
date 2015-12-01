'use strict';

var time = require('./util/time');
var logger = require('../logger.js')('transaction');
var Message = require('./message');
var logLine = require("./util/logline");
var BufferBuilder = require("buffer-builder");

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
     */
     toBuffer() {
        var bf = new BufferBuilder();
        var beginTime = time.date2str(this.beginTime);
        var endTime = time.date2str(this.endTime);
        var dur = time.durationInMicros(this.beginTime, this.endTime) + 'us';

        if (this.children.length == 0) {
            //Auto transaction
            return logLine(["A" + beginTime, this.type, this.name, this.status, dur, this.data, '']);
        } else {
            //有子元素
            bf.appendBuffer(logLine(['t' + beginTime, this.type, this.name, '']));
            this.children.forEach(child => {
                bf.appendBuffer(child.toBuffer());
            });
            bf.appendBuffer(logLine(['T' + endTime, this.type, this.name, this.status, dur, this.data, '']));
        }
        return bf.get();
    }

}


module.exports = Transaction;
