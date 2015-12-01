'use strict';

var logger = require('../logger.js')('message');
/**
 * Get an instance of a basic message.
 *
 * @param {object} options Message options for initialization.
 */
class Message {
    constructor(options) {
        options = options||{};
        this.type = options.type || undefined;
        this.name = options.name || undefined;
        this.status = options.status || 0;
        this.beginTime = options.beginTime || new Date();
        this.endTime = options.endTime || new Date();
        this.data = options.data || undefined;

        this.children = options.children || [];
        this.parent = null;
//    this.uid = options.uid || undefined;
//    this.uid = rand.generate();
        this.isBegin = options.isBegin || false;
        this.isEnd = options.isEnd || false;
        this.allEnd = false;
        this.tree = null; //如果作为tree的根节点，这个属性作为索引
//    this.puid = options.puid || undefined;
    }


     addOptions(options) {
        Object.keys(options).forEach(prop => {
            if (prop === 'data') {
                if (this[prop] === undefined || this[prop] === null) {
                    this[prop] = options[prop];
                } else {
                    this[prop] = this[prop] + options[prop];
                }
            } else {
                this[prop] = options[prop];
            }
        });
    }


    begin() {
        if (this.isBegin) {
            return;
        }

        this.isBegin = true;
        this.beginTime = new Date();
    }

    end() {
        if (this.isEnd) {
            return;
        }

        this.isEnd = true;
        this.endTime = new Date();
    }


    addChild(message) {
        var self = this;
        Array.prototype.forEach.call(arguments, message => {
            self.children.push(message);
            message.parent = self;
            //如果当前的已经结束,但是加进来的节点没有end
            if (self.allEnd && !message.isAllEnd()) {
                self.allEnd = false;
            }
        });

    }

    removeChild() {
        var children = this.children;
        Array.prototype.forEach.call(arguments, message => {
            var index = children.indexOf(message);
            if (index > -1) {
                children.splice(index, 1);
                message.parent = null;
            }
        });
        this.isAllEnd();
    }

    /**
     *  是否自己和子节点全部都已经End
     * */
    isAllEnd() {
        if (this.allEnd) {
            return true;
        }
        if (!this.children.length) {
            return this.allEnd = this.isEnd;
        }
        this.allEnd = (this.isEnd && this.children.every(child => child.isAllEnd()));
        return this.allEnd;
    }

    /**
     * 子类复写
     * */
    toBuffer(){
        return new Buffer();
    }

}


module.exports = Message;
