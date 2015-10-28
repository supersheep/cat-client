'use strict';

var events = require('events');
var rand = require('random-key');
var cls = require('./cls');
var trees = require('../org/trees');

var CAT_NS = cls.createNamespace('CAT-NS');
var CAT_NS_KEY = 'CAT-NS-KEY';
var sendEmitter = new events.EventEmitter();
var sendSignal = 'send';
var await = {};

CAT_NS.CAT_NS_KEY = CAT_NS_KEY;
CAT_NS.rand = rand;
CAT_NS.sendEmitter = sendEmitter;
CAT_NS.sendSignal = sendSignal;
CAT_NS.await = await;

sendEmitter.on(sendSignal, trees.sendTree);

function run(fn) {
    return CAT_NS.run.call(CAT_NS, fn);
};

function get() {
    return CAT_NS.get.call(CAT_NS, CAT_NS_KEY)
};

function set(uid) {
    return CAT_NS.set.call(CAT_NS, CAT_NS_KEY, uid);
};

module.exports = {
    run: run,
    get: get,
    set: set
};
