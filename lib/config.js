// read config due to environment
var util = require('util');
var os = require('os');
var path = require('path');
var fs = require('fs');
var readonly = require('read-only');
var logger = require('@dp/logger-container')('cat-client[config]');

var CAT_HOME = process.env.CAT_HOME || '/data/appdatas/cat/';
//TODO
var CLIENT_CONFIG = path.join(CAT_HOME, 'client.json');

var config = {
    servers: [],
    mode: undefined,
    maxMessageLength: 2000,
    hostname: os.hostname(),
    domain: 'node-cat'
};

(function() {
    var _ip;
    Object.defineProperty(config, 'ip', {
        enumerable: true,
        configurable: false,
        get: function() {
            if (!_ip)
                _ip = module.exports.getLocalIP();

            return _ip;
        },
        set: noop
    });
})();


if (!fs.existsSync(CLIENT_CONFIG)) {
    logger.error(util.format('Cannot read cat config from ' + CLIENT_CONFIG + '.'));
} else {
    mergeConfig(CLIENT_CONFIG);
}

module.exports = function() {
    return readonly(config);
};

module.exports.addServer = function(server) {
    if (!~config.servers.indexOf(server)) {
        config.servers.push(server);
    }
};

module.exports.getLocalIP = function() {
    var ip = process.env.HOST_IP;
    if (!ip) {
        var interfaces = os.networkInterfaces();
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        addresses.length && (ip = addresses[0]);
    }
    return ip;
};

function mergeConfig(path) {
    var doc = require(path);

    // read mode
    config.mode = doc.mode;

    // read servers
    var servers = doc.servers;
    servers.forEach(function(server) {
        var s = server.ip + ':' + server.port;
        if (!~config.servers.indexOf(s)) {
            config.servers.push(s);
        }
    });

    // read domain
    config.domain = doc.domain;
}

function noop() {}
