'use strict';

var util = require('util'),
    escape = require('js-string-escape'),
    logger = require('../logger'),
    exception = require('../exception'),
    time = require('./util/time'),
    Message = require('./Message');

/**
 * Get an instance of an  event
 * Event is inherited from the message.
 *
 * @param {object} event options.
 */
function Event(options) {
    Message.call(this, options);
}
util.inherits(Event, Message);

/**
 * Format the event for sending. An event must obey the
 * following format.
 * {ETimestamp\tType\tName\tStatus\tDuration\tData\t\n}
 *
 * @exception {fatal} Unsupported event class, do nothing but throw it.
 *
 * @param {string} E.
 */
Event.prototype.toString = function(_class) {
    if (_class !== 'E') {
        throw exception.CatFatal('Unsupported event class %s', _class);
    }

    var classTimeStr = _class + time.date2str(this.beginTime);
    var typeStr = this.type;
    var nameStr = this.name;
    var statusStr = this.status;
    var dataStr = this.data;

    return [classTimeStr, typeStr, nameStr, statusStr, dataStr, ''].map(function(elem) {
        return (elem !== undefined && elem != null) ? escape(elem) : '';
    }).join('\t') + '\n';
};

module.exports = Event;
