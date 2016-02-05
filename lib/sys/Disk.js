'use strict';
var SystemInfo = require("./SystemBaseInfo");

class Disk extends SystemInfo {

    constructor() {
        super("disk");
    }
}

class DiskVolume extends SystemInfo {
    constructor(drive) {
        super("disk-volume");
        this.drive = drive;
    }

    selfCollect() {

    }
}


exports.Disk = Disk;
exports.DiskVolume = DiskVolume;