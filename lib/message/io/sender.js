var net = require('net');
var url = require('url');
var logger = require('../../logger.js')('sender');
var ConnectionPool = require('jackpot');

var config = require('../../config')();
if (!config.server) {
    return module.exports.send = function(data, done) {};
    logger.error("No cat server address configed for client.");
}

var pool = new ConnectionPool(100, function() {
    // TODO: fallback when fail or round-robin rotation
    var server = config.server;
    return net.connect(server.port, server.ip);
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
