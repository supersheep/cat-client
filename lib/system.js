var Cat = new (require("./cat").CatClass)();
var HeartBeat = require("./message/heartbeat");
var SystemInfo = require("./sys/SystemBaseInfo");
var Time = require("./message/util/time");
var os = require("os");
var v8 = require("v8");
var Disk = require("./sys/Disk2");
var cluster = require("cluster");

var userName = require('child_process').execSync("whoami", {encoding: 'utf8', timeout: 1000}).replace('\n', '');

exports.collectSysInfo = function () {

    //not working in pm2 cluster mod
    //if (cluster.isWorker) {
    //    //仅让master发心跳, cat server只会保存60条心跳
    //    return;
    //}

    function sys() {
        var t = Cat.newTransaction("System", "Status");

        var totalMemory = os.totalmem();
        var freeMemory = os.freemem();
        var heap = v8.getHeapStatistics();
        var loadAverage = os.loadavg()[0];
        var rootDisk = Disk.usage('/');
        var dataDisk = Disk.usage('/data');

        //build system xml

        //status is root node
        var status = new SystemInfo("status", {
            timestamp: Time.date2str(new Date())
        });

        //runtime
        var runtime = new SystemInfo("runtime", {
            'start-time': +new Date(),
            'up-time': os.uptime(),
            'node-version': process.version,
            'user-name': userName
        });
        runtime.addChild(new SystemInfo("user-dir", {}, '/'));
        status.addChild(runtime);


        //os
        status.addChild(new SystemInfo('os', {
            name: os.type(),
            arch: os.arch(),
            'available-processors': os.cpus().length,
            'system-load-average': loadAverage,
            'total-physical-memory': os.totalmem(),
            'free-physical-memory': os.freemem()
        }));

        //disk
        var disk = new SystemInfo('disk');
        if (rootDisk) {
            disk.addChild(new SystemInfo('disk-volume', {
                id: '/',
                total: rootDisk.total,
                free: rootDisk.free,
                usable: rootDisk.available
            }));
        }
        if (dataDisk) {
            disk.addChild(new SystemInfo('disk-volume', {
                id: '/data',
                total: dataDisk.total,
                free: dataDisk.free,
                usable: dataDisk.available
            }));
        }
        status.addChild(disk);

        //memory
        var memory = new SystemInfo("memory", {
            max: totalMemory,
            total: totalMemory,
            free: freeMemory,
            'heap-usage': heap.total_heap_size,
            'non-heap-usage': heap.total_heap_size - heap.used_heap_size
        });
        status.addChild(memory);
        //TODO gc
        memory.addChild(new SystemInfo("gc", {
            name: 'ParNew',
            count: 0,
            time: 0
        }));
        memory.addChild(new SystemInfo('gc', {
            name: 'ConcurrentMarkSweep',
            count: 0,
            time: 0
        }));

        //thread
        var thread = new SystemInfo('thread', {
            count: "235",
            'daemon-count': "232",
            'peek-count': "243",
            'total-started-count': "3156",
            'cat-thread-count': "0",
            'pigeon-thread-count': "0",
            'http-thread-count': "0"
        });
        thread.addChild(new SystemInfo('dump'));
        status.addChild(thread);

        //message
        status.addChild(new SystemInfo('message', {
            produced: "0",
            overflowed: "0",
            bytes: "0"
        }));

        //System Extension
        var systemExtension = new SystemInfo("extension", {
            id: "System"
        });
        status.addChild(systemExtension);
        systemExtension.addChild(new SystemInfo("extensionDetail", {
            id: "LoadAverage",
            value: loadAverage
        }));
        systemExtension.addChild(new SystemInfo("extensionDetail", {
            id: "FreePhysicalMemory",
            value: freeMemory
        }));
        //TODO
        systemExtension.addChild(new SystemInfo('extensionDetail', {
            id: 'FreeSwapSpaceSize',
            value: 0
        }));

        //Disk Extension
        var diskExtension = new SystemInfo('extension', {
            id: "Disk"
        });
        status.addChild(diskExtension);
        if (rootDisk) {
            diskExtension.addChild(new SystemInfo('extensionDetail', {
                id: "/ Free",
                value: rootDisk.free
            }));
        }
        if (dataDisk) {
            diskExtension.addChild(new SystemInfo('extensionDetail', {
                id: "/data Free",
                value: dataDisk.free
            }));
        }


        //console.log(status.toString());

        Cat.treeManager.addMessage(new HeartBeat({
            data: '<?xml version="1.0" encoding="utf-8"?>\n' + status.toString()
        }));

        t.setStatus(Cat.STATUS.SUCCESS);
        t.complete();
    }

    sys();
    setInterval(sys, 60000);

};



