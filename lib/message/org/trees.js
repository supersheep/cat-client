'use strict';

var logger = require('@dp/logger-container')('cat-client[trees]'),
    exception = require('../../exception'),
    sender = require('../io/sender'),
    Tree = require('./tree'),
    time = require('../util/time');

/**
 * Hashes for fast searching.
 *
 * @TODO:
 * Fast searching and fast cleaning is a trade-off. Choosing
 * fast searching is really good?
 */
var treeHash = {},
    nodeHash = {},
    rootHash = {};

/**
 * Add message to its parent in the message tree. If the message
 * to be added is the root, create a new tree.
 *
 * @exception {error} Parent message not found, do nothing but throw it.
 *
 * @param {object} message Message to be added.
 * @param {string} uid Message unique id.
 * @param {string} puid Parent message unique id.
 */
function addMessage(message, uid, puid) {
    message.uid = uid;
    message.puid = puid;

    if (!puid) {
        _setMessage(uid, message);
        _setTree(uid, new Tree({
            root: message
        }));
        _setRoot(uid, message);
    } else {
        var parent = _getMessage(puid);
        if (!parent) {
            throw new exception.CatError('Parent message not found.');
        }

        parent.children.push(message);
        _setMessage(uid, message);
        _setTree(uid, _getTree(puid));
        _setRoot(uid, _getRoot(puid));
    }
}

/**
 * Begin the message.
 *
 * @exception {error} Message not found, do nothing but throw it.
 * @exception Any error thrown from the lower level, throw it.
 *
 * @param {string} uid Message unique id.
 */
function beginMessage(uid) {
    var message = _getMessage(uid);

    if (!message) {
        throw new exception.CatError('Message not found.');
    }

    try {
        message.begin();
    } catch (err) {
        throw err;
    }
}

/**
 * End the message. If the message is set manual-send, send it
 * right after ending it.
 *
 * @exception {error} Message not found, do nothing and throw it.
 * @exception Any error thrown from the lower level, throw it.
 *
 * @param {string} uid Message unique id.
 */
function endMessage(uid) {
    var message = _getMessage(uid);

    if (!message) {
        console.log(uid);
        throw new exception.CatError('Message not found');
    }

    try {
        message.end();
    } catch (err) {
        throw err;
    }

    if (!message.puid) {
        sendTree(uid, null);
    }
}

/**
 * Add options to the message.
 *
 * @exception {error} Message not found, do nothing and throw it.
 * @exception Any error thrown from the lower level, throw it.
 *
 * @param {string} uid Message unique id.
 * @param {options} options Message options to be added to the message.
 */
function addMessageOptions(uid, options) {
    var message = _getMessage(uid);

    if (!message) {
        throw new exception.CatError('Message not found.');
    }

    try {
        message.addOptions(options);
    } catch (err) {
        throw err;
    }
}

/**
 * Send the message tree which the given message resides in. This
 * function is asynchronous and takes a callback as its last parameter.
 *
 * @exception {error} Message tree not found, log it.
 * @exception Any error thrown from the lower level or the callback, log it.
 *
 * @param {string} uid Message unique id.
 * @param {function} cb Callback.
 */
function sendTree(uid, cb) {
    logger.info('Send message tree(curr uid = ' + uid + ').');

    var tree = _getTree(uid);

    if (!tree) {
        logger.error('Send message tree(curr uid = ' + uid + ') failure. ' +
            'Message tree not found.');
        return cb || cb(err);
    }

    var serializeBeginTime = new Date();
    try {
        var treeSerialized = tree.serialize();
    } catch (err) {
        if (err instanceof exception.CatError) {
            logger.error(util.format('Send message tree(curr uid = ' + uid + ') failure.'),
                err.message);
        } else if (err instanceof exception.CatFatal) {
            logger.error(util.format('Send message tree(curr uid = ' + uid + ') failure.'),
                err.message);
        }

        logger.error('Unsupported error caught. ' + err);

        return cb || cb(err);
    }
    var serializeEndTime = new Date();
    logger.info('Serialize the message tree(curr uid = ' + uid + '), cost ' + time.durationInMicros(serializeBeginTime,
            serializeEndTime) + 'us, ' +
        'message tree size ' + treeSerialized.length + ' bytes.');

    sender.send(tree.serialize(), function(err) {
        if (err) {
            logger.error(util.format('Send message tree(curr uid = ' + uid + ') failure.'),
                err);
            return cb || cb(err);
        }

        logger.info('Send message tree(curr uid = ' + uid + ') success.');

        var removeBeginTime = new Date();
        removeTree(uid);
        var removeEndTime = new Date();
        logger.info('Clean up the message tree(curr uid = ' + uid + '), cost ' +
            time.durationInMicros(removeBeginTime, removeEndTime) + 'us.');
    });
}

/**
 * Clean up all the message in the tree which the given message
 * resides in.
 *
 * @param {string} uid Message unique id.
 */
function removeTree(uid) {
    _setTree(uid, undefined);

    var root = _getRoot(uid);
    _setRoot(uid, undefined);

    (function removeMessage(message) {
        if (message) {
            _setMessage(message.uid, undefined);
            _setTree(message.uid, undefined);
            _setRoot(message.uid, undefined);

            message.children.map(function(child) {
                removeMessage(child);
            });
        }
    }(root));
}

/**
 * Get the message according to the given unique id. Returns
 * null or undefined if the message is not found.
 *
 * @param {string} uid Message unique id.
 */
function _getMessage(uid) {
    return nodeHash[uid];
}

/**
 * Set the message according to the given unique id.
 *
 * @param {string} uid Message unique id.
 * @param {object} message New message.
 */
function _setMessage(uid, message) {
    nodeHash[uid] = message;
}

/**
 * Get the tree which the message with the given unique id resides in.
 * Returns null or undefined if the tree is not found.
 *
 * @param {string} uid Message unique id.
 */
function _getTree(uid) {
    return treeHash[uid];
}

/**
 * Set the tree which the message with the given unique id resides in.
 *
 * @param {string} uid Message unique id.
 * @param {object} tree New tree.
 */
function _setTree(uid, tree) {
    treeHash[uid] = tree;
}

/**
 * Get the root message of the tree which the message with the given
 * unique id resides in. Returns null or undefined if the tree is not found.
 *
 * @param {string} uid Message unique id.
 */
function _getRoot(uid) {
    return rootHash[uid];
}

/**
 * Set the root message of the tree which the message with the given
 * unique id resides in.
 *
 * @param {string} uid Message unique id.
 * @param {object} root New root.
 */
function _setRoot(uid, root) {
    rootHash[uid] = root;
}

module.exports = {
    addMessage: addMessage,
    beginMessage: beginMessage,
    endMessage: endMessage,
    addMessageOptions: addMessageOptions,
    sendTree: sendTree,
    removeTree: removeTree
};
