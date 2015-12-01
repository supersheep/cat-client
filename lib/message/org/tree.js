'use strict';

var escape = require('js-string-escape'),
    config = require('../../config')(),
    Transaction = require('../transaction'),
    Event = require('../event'),
    logger = require('../../logger.js')('tree'),
    id = require('../id');

var BufferBuilder = require("buffer-builder");
var logLine = require("../util/logline");

/*
 *
 * Constants.
 *
 */
const VERSION = 'PT1';

/**
 * Get an instance of a message tree.
 *
 * @param {object} options Tree options for initialization.
 */
function Tree(options) {
    this.domain = options.domain || config.domain;
    this.hostName = options.hostName || config.hostName;
    this.ip = options.ip || config.ip;
    this.groupName = options.groupName || config.groupName;
    this.clusterId = options.clusterId || config.clusterId;
    this.clusterName = options.clusterName || config.clusterName;
    this.messageId = options.messageId || id.nextId();
    this.parentMessageId = options.parentMessageId || this.messageId;
    this.rootMessageId = options.rootMessageId || this.messageId;
    this.sessionToken = options.sessionToken || config.sessionToken;

    this.root = options.root || undefined;
    if (this.root) {
        this.root.tree = this;
    }
}

/**
 * Format the message tree to send. The header of the message
 * tree must obey the following format.
 * {VERSION\tDomain\tHostName\tIP\tGroupName\tClusterId\tClusterName\t
 *  MessageId\tParentMessageId\tRootMessageId\tSessionToken\t\n}
 *
 * @exception {fatal} Unsupported message type, do nothing but throw it.
 * @exception Any error thrown from the lower level, throw it.
 */


Tree.prototype.toBuffer = function () {
    var that = this;
    var bf = new BufferBuilder();


    var treeHead = [VERSION, that.domain, that.hostName,
        that.ip, that.groupName, that.clusterId,
        that.clusterName, that.messageId, that.parentMessageId,
        that.rootMessageId, that.sessionToken
    ];

    bf.appendBuffer(logLine(treeHead));
    bf.appendBuffer(that.root.toBuffer());

    return bf.get();
};

/**
 * Serialize the message tree and return a buffer for sending.
 * At the beginning of the buffer there are 4 bytes representing
 * the size of the message tree in big-endian.
 *
 * @exception Any error thrown from the lower level, throw it.
 */
Tree.prototype.serialize = function () {
    var treeBuffer = this.toBuffer();

    var bf = new BufferBuilder();
    bf.appendInt32BE(treeBuffer.length);
    bf.appendBuffer(treeBuffer);
    return bf.get();
};

module.exports = Tree;
