var net = require('net');
var logger = require('../../logger.js')('sender');
var ConnectionPool = require('jackpot');

var config = require('../../config')();
if (!config.server) {
    logger.error("No cat server address configed for client.");
    return module.exports.send = function (data, done) {
    };

}
//
//var pool = new ConnectionPool(5, function () {
//    // TODO: fallback when fail or round-robin rotation
//    var server = config.server;
//    return net.connect(server.port, server.ip);
//}, {
//    retries: 1
//});

var client;
var createConnection = function () {
    var server = config.server;
    client = net.connect(server.port, server.ip);
    client.on("error", function (e) {
        logger.error(e);
    });

    client.on("close", ()=> {
        client.removeAllListeners();
        createConnection();
    });
};

createConnection();

/**
 *
 * @param {Buffer|MessageTree} data
 * @param {function=} done
 */
module.exports.send = function (data, done) {

    client.write(data);

//    pool.pull(function (err, connection) {
//        if (err) {
//            logger.error(err);
//            return done && done(err);
//        }
//
//        if (Buffer.isBuffer(data)) {
//            connection.write(data);
//        }
//
//        done && done();
//    });
};
