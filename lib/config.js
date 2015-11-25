// read config due to environment
var util = require('util');
var os = require('os');
var path = require('path');
var fs = require('fs');
var readonly = require('read-only');
var logger = require('./logger.js')('config');

var CAT_HOME = process.env.CAT_HOME || '/data/appdatas/cat/';
var CLIENT_CONFIG_FILE = path.join(CAT_HOME, 'client.xml');
var xml = require('xml2js');

var config = {
    server: undefined,
    maxMessageLength: 2000,
    hostname: os.hostname(),
    domain: 'node-cat'
};

(function () {
    var _ip;
    Object.defineProperty(config, 'ip', {
        enumerable: true,
        configurable: false,
        get: function () {
            if (!_ip)
                _ip = module.exports.getLocalIP();

            return _ip;
        },
        set: noop
    });
})();


if (!fs.existsSync(CLIENT_CONFIG_FILE)) {
    logger.error(util.format('Cannot read cat config from ' + CLIENT_CONFIG_FILE + '.'));
} else {
    mergeConfig(CLIENT_CONFIG_FILE);
}

module.exports = function () {
    return readonly(config);
};

module.exports.setDomain = function (domain) {
    config.domain = domain
};

module.exports.addServer = function (server) {
    if (!~config.servers.indexOf(server)) {
        config.servers.push(server);
    }
};

module.exports.getLocalIP = function () {
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

function mergeConfig() {
    try {
        var content = fs.readFileSync(CLIENT_CONFIG_FILE);

        xml.parseString(content.toString(), function (err, result) {
            if (result && result.config && result.config.servers) {
                //ip and port
                config.server = result.config.servers[0].server[0].$;
            }
        });


    } catch (e) {
        logger.error("Read File " + CLIENT_CONFIG_FILE + " Fail");
    }

}

function noop() {
}
