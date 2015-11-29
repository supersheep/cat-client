'use strict';

var Cat = require('../index');

/**
 * Log transaction to the cat-server.
 *
 * The following example should output like this(timestamp is arbitrary):
 * A17:04:11.898    whatt    anyname        1006ms lalallal
 */

var t = Cat.newTransaction("TransactionTest", "case1");

Cat.logEvent("EventInTransaction", "T1");
Cat.logError("ErrorInTransaction", new Error());

t.setStatus(Cat.STATUS.SUCCESS);

t.complete();