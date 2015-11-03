'use strict';

var Cat = require('../index');

var t = Cat.newTransaction({
    type: 'whatt-2',
    name: 'anyname-2'
});
Cat.logEvent({
    type: 'test-node-2',
    name: 'log-event-2',
    status: 0,
    data: 'hello-world-2'
});
var t1 = Cat.newTransaction({
    type: 'whatt-12',
    name: 'anyname-12'
});
Cat.logEvent({
    type: 'test-node-12',
    name: 'log-event-12',
    status: 0,
    data: 'hello-world-12'
});
t1.complete();
Cat.logError({
    msg: 'lllllllll',
    cause: new Error('oooooooo')
});
t.setStatus('0');
t.addData('lalallal');

t.complete();
