'use strict';

var Cat = require('../index');

var finish = function() {
    console.log('End log event example.');
}

var t = Cat.newTransaction({
    type: 'whatt',
    name: 'anyname',
    manualSend: true
});

t.beginTransaction();

t.setTransactionStatus(0);
t.addTransactionData('lalallal');

setTimeout(function() {
    t.endTransaction();
}, 1000);
