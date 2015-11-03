var Cat = require('../index');

/**
 * Log events to the cat-server.
 *
 * The following example should output like this(timestamp is arbitrary):
 * E16:44:18.621    test-node-0 log-event-0     hello-world-0
 * E16:44:19.638    test-node-1 log-event-1 1   hello-world-1
 */

Cat.logEvent({
    type: 'test-node-0',
    name: 'log-event-0',
    status: 0,
    data: 'hello-world-0'
});

setTimeout(function() {
    Cat.logEvent({
        type: 'test-node-1',
        name: 'log-event-1',
        status: 1,
        data: 'hello-world-1'
    })
}, 1000);
