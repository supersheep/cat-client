var net = require('net');
var logger = require('../../logger.js')('sender');
var debug = require("debug")("cat:sender");

var config = require('../../config')();
var request = require("request");


if (!config.server) {
    logger.error("No cat server address configed for client.");
    return exports.send = function (data, done) {

    };
}

/**
 * 连接配置的默认
 * 然后请求 http://默认ip:8080/cat/s/router?domain=应用名&op=json&ip=当前应用机器ip
 * 读取服务器列表 ，列表的第一个ip作为主服务器，其他备用
 * */

var currentClient;
var clientPool = [];
var messageQueue = []; //消息队列

var createConnection = function (port, ip, isMain) {
    debug("create connection");
    var client = net.connect(port, ip);
    client.setKeepAlive(true);
    var reconnect = function () {
        debug("reconnect ", ip, port);
        client.removeAllListeners();
        //移除自己
        var index = clientPool.indexOf(client);
        if (index > -1) {
            clientPool.splice(index, 1);
        }
        if (currentClient == client) {
            currentClient = nextClient();
        }
        createConnection(port, ip, isMain);
    };

    client.on("error", reconnect);

    client.on("close", reconnect);

    client.once("connect", () => {
        if (isMain) {
            //主服务器连上之后
            currentClient = client;
        }
        clientPool.push(client);


        //TODO heartbeat
    });
};
var nextClient = function () {
    return clientPool[0];
};


createConnection(config.server.port, config.server.ip, false);

var url = "http://" + config.server.ip + ":8080/cat/s/router?domain=" + config.domain + "&op=json&ip=" + config.ip;
request(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
        try {
            debug("get routers body");
            var routers = JSON.parse(body).kvs.routers;
            if (!routers) {
                return;
            }
            routers.split(";").forEach((ipStr, i)=> {
                var arr = ipStr.split(":");
                if (arr[0] && arr[1]) {
                    createConnection(arr[1], arr[0], i == 0);
                }
            });
        } catch (e) {
        }
    }
});

/**
 * execute messageQueue
 * */

(function execute() {
    if (currentClient) {
        while (messageQueue.length) {
            try {
                currentClient.write(messageQueue.shift().serialize());
            }catch(e){}
        }
    }
    setImmediate(execute);
})();

/**
 *
 * @param {Buffer|MessageTree} data
 * @param {function=} done
 */
module.exports.send = function (tree) {
    messageQueue.push(tree);

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
