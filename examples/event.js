var Cat = require('../index');

/**
 * Log events to the cat-server.
 *
 * The following example should output like this(timestamp is arbitrary):
 * E13:48:10.666  log-example-type-0  log-example-name-0    hello-world-0
 * E13:48:11.678  log-example-type-1  log-example-name-1  1 hello-world-1
 */
var finish = function() {
    console.log('End log event example.');
}

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
    finish();
}, 1000);
