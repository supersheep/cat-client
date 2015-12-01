'use strict';

var escape = require('js-string-escape');
var time = require('./util/time');
var logger = require('../logger.js')('event');
var Message = require('./message');
var logLine = require("./util/logline");
/**
 * Get an instance of an  event
 * CatEvent is inherited from the Message.
 *
 * @param {object} event options.
 */
class CatEvent extends Message {
    constructor(options) {
        super(options);
        this.begin();
        this.end();
    }

    /**
     * Format the event for sending. An event must obey the
     * following format.
     * {ETimestamp\tType\tName\tStatus\tDuration\tData\t\n}
     *
     * @exception {fatal} Unsupported event class, do nothing but throw it.
     *
     */

    toBuffer() {
        return logLine(["E" + time.date2str(this.beginTime), this.type, this.name, this.status, this.data, ''])
    }
}


module.exports = CatEvent;
