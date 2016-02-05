'use strict'
var Message = require("./message");
var logLine = require("./util/logline");
var time = require('./util/time');
var config = require("../config")();

class Heartbeat extends Message {
    constructor(options) {
        super(options);
        this.type = "HeartBeat";
        this.name = config.ip;
        this.status = "0";
        this.begin();
        this.end();
    }

    toBuffer() {
        return logLine(["H" + time.date2str(this.beginTime), this.type, this.name, this.status, this.data,""])
    }
}

module.exports = Heartbeat;