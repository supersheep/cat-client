'use strict';

var logger = require('@dp/logger-container')('message'),
    exception = require('../exception');

/**
 * Get an instance of a basic message.
 *
 * @param {object} options Message options for initialization.
 */
function Message(options) {
    this.type = options.type || undefined;
    this.name = options.name || undefined;
    this.status = options.status || 0;
    this.beginTime = options.beginTime || new Date();
    this.endTime = options.endTime || new Date();
    this.data = options.data || undefined;

    this.children = options.children || [];
    this.uid = options.uid || undefined;
    this.isBegin = options.isBegin || false;
    this.isEnd = options.isEnd || false;
    this.puid = options.puid || undefined;
};

/**
 * Add options to the message.
 *
 * @param {object} options Message options to be added.
 */
Message.prototype.addOptions = function(options) {
    Object.keys(options).forEach(function(prop) {
        if (prop === 'data') {
            if (this[prop] === undefined || this[prop] === null) {
                this[prop] = options[prop];
            } else {
                this[prop] = this[prop] + options[prop];
            }
        } else {
            this[prop] = options[prop];
        }
    }, this);
};

/**
 * Begin a message.
 *
 * @exception {error} Message already end, do nothing but throw it.
 */
Message.prototype.begin = function() {
    if (this.isEnd) {
        throw exception.CatError('Message already end.');
    }

    if (this.isBegin) {
        logger.warn('Message already begin, overwrite the earlier begin time.');
    }

    this.isBegin = true;
    this.beginTime = new Date();
};

/**
 * End a message.
 *
 * @exception {error} Message not begin yet, do nothing but throw it.
 */
Message.prototype.end = function() {
    if (!this.isBegin) {
        throw exception.CatError('Message not begin yet.');
    }

    if (this.isEnd) {
        logger.warn('Message already end, overwrite the earlier end time.');
    }

    this.isEnd = true;
    this.endTime = new Date();
};

module.exports = Message;
