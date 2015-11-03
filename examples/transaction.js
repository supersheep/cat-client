'use strict';

require('./transaction-1.js');
var Cat = require('../index');

/**
 * Log transaction to the cat-server.
 *
 * The following example should output like this(timestamp is arbitrary):
 * A17:04:11.898	whatt	anyname	 	1006ms lalallal
 */

var t = Cat.newTransaction({
    type: 'whatt',
    name: 'anyname'
});
Cat.logEvent({
    type: 'test-node-0',
    name: 'log-event-0',
    status: 0,
    data: 'hello-world-0'
});
var t1 = Cat.newTransaction({
    type: 'whatt-1',
    name: 'anyname-1'
});
Cat.logEvent({
    type: 'test-node-1',
    name: 'log-event-1',
    status: 0,
    data: 'hello-world-1'
});
t1.complete();
Cat.logError({
    msg: 'lllllllll',
    cause: new Error('oooooooo')
});
t.setStatus('0');
t.addData('lalallal');

setTimeout(function() {
    t.complete();
}, 1000);
