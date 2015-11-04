var net = require('net');
var url = require('url');
var logger = require('@dp/logger-container')('sender');
var ConnectionPool = require('jackpot');

var config = require('../../config')();
if (!config.servers.length) {
    throw new Error("No cat servers' addresses configed for client");
}

var pool = new ConnectionPool(100, function() {
    // TODO: fallback when fail or round-robin rotation
    var server = config.servers[0];
    var s = server.split(':');
    return net.connect(s[1], s[0]);
}, {
    retries: 5
});

/**
 *
 * @param {Buffer|MessageTree} data
 * @param {function=} done
 */
module.exports.send = function(data, done) {

    pool.pull(function(err, connection) {
        if (err) {
            logger.error(err);
            return done && done(err);
        }

        if (Buffer.isBuffer(data)) {
            connection.end(data);
        } else {
            try {

                var bb = codec.encode(data);
                data = bb._bytes.slice(0, bb.position());
            } catch (e) {
                return done(e);
            }

            if (Buffer.isBuffer(data))
                connection.end(data);
        }

        done && done();

        // TODO: statistics

    });
};
