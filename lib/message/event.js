'use strict';

var escape = require('js-string-escape');
var time = require('./util/time');
var logger = require('../logger.js')('event');
var Message = require('./message');

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

     toString() {
        var classTimeStr = "E" + time.date2str(this.beginTime);
        var typeStr = this.type;
        var nameStr = this.name;
        var statusStr = this.status;
        var dataStr = this.data;

        return [classTimeStr, typeStr, nameStr, statusStr, dataStr, ''].map(function (elem) {
            return (elem !== undefined && elem != null) ? escape(elem) : '';
        }).join('\t') + '\n';
    }
}


module.exports = CatEvent;
