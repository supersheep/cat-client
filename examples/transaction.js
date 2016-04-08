'use strict';

var Cat = require('../index');

/**
 * Log transaction to the cat-server.
 *
 * The following example should output like this(timestamp is arbitrary):
 * A17:04:11.898    whatt    anyname        1006ms lalallal
 */

for(let i=0;i<1000;i++) {

    var t = Cat.newTransaction("TransactionTest1", "case1");

    Cat.logEvent("EventInTransaction", "T1");
    Cat.logError("ErrorInTransaction", new Error());

    t.setStatus(Cat.STATUS.SUCCESS);
    t.logEvent("childEvent","1");
    t.logError("childError", new Error());
    t.complete();
}