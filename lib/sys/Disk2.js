/**
 * user child process to get disk space
 * */

'use strict';
var exec = require("child_process").execSync;


if (process.platform == 'linux' ||
    process.platform == 'freebsd' ||
    process.platform == 'darwin' ||
    process.platform == 'sunos') {


    exports.usage = function (drive) {
        try {
            var res = exec("df -k '" + drive.replace(/'/g, "'\\''") + "'").toString();
            var lines = res.trim().split("\n");

            var str_disk_info = lines[lines.length - 1].replace(/[\s\n\r]+/g, ' ');
            var disk_info = str_disk_info.split(' ');

            return {
                available:disk_info[3] * 1024,
                total:disk_info[1] * 1024,
                free:disk_info[3] * 1024
            }

        } catch (e) {
            console.log(e);
            return null;
        }

    }
} else {
    exports.usage = function () {
        return null;
    }
}