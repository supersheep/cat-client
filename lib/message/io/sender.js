'use strict';

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
        debug("connect to cat server ", ip);
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
const HALF = 32;
const MAX = 10000;
const SINGLE = 100;
var immediate = null;
var execute = function () {
    if (currentClient) {
        let length = messageQueue.length;
        if (length > MAX) {
            length = Math.floor(length / HALF);
        } else {
            if (length > SINGLE) {
                length = SINGLE;
            }
        }
        for (let i = 0; i < length; i++) {
            debug("send data");
            currentClient.write(messageQueue.shift().serialize());
        }
    }
    if (messageQueue.length) {
        immediate = setImmediate(execute);
    } else {
        immediate = null;
    }
};
execute();

/**
 * @param tree
 */
exports.send = function (tree) {
//    debug("push tree");
    messageQueue.push(tree);
    if (immediate == null) {
        immediate = setImmediate(execute);
    }
};
