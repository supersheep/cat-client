var Cat = require('../index');

/**
 * Log events to the cat-server.
 *
 * The following example should output like this(timestamp is arbitrary):
 * E16:44:18.621    test-node-0 log-event-0     hello-world-0
 * E16:44:19.638    test-node-1 log-event-1 1   hello-world-1
 */

for(var i=0;i<1000;i++) {
    Cat.logEvent('category-0', 'category-1');

    Cat.logEvent('category-0-1', 'category-1-1', Cat.STATUS.FAIL, "some data");
}