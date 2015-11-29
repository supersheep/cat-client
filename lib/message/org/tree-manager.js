'use strict';

var sender = require('../io/sender');
var Tree = require('./tree');
var time = require('../util/time');
var logger = require('../../logger.js')('tree-manager');
var Message = require("../message");
var Event = require("../event");
var Transaction = require("../transaction");
var debug = require("debug")("cat:tree-manager");

class TreeManager {
    constructor() {
        //第一个transaction message会构建tree
        this.tree = null;

        //最近一个挂上去的transaction message
        this.lastNode = null;
    }

    /**
     * 添加一个message到tree中，
     * 如果是transaction ， 构建树结构
     * 如果是Event,挂到transaction下面或者直接发送
     * */

    addMessage(message) {
        var tree = this.tree;
        var lastNode = this.lastNode;

        //Transaction
        if (message instanceof  Transaction) {
            //已经构建过tree了,加入到最后一个transaction的子节点
            if (tree) {
                lastNode.addChild(message);
                this.lastNode = message;
            } else {
                this.tree = new Tree({
                    root: message
                });
                this.lastNode = message;
            }
            message.begin();
        }
        //Event
        else if (message instanceof  Event) {

            if (tree) {
                lastNode.addChild(message);
            } else {
                //没有构建过树的时候，直接把消息发出去
                this.sendTree(new Tree({
                    root: message
                }));
            }
        }
    }

    /**
     * 某个transaction结束
     *  如果是叶子节点:
     *      修改状态
     *      通知父节点
     *  如果是父节点:
     *      判断子节点的transaction是否end，
     *          如果没结束，说明add的时候挂的节点是不对的，需要修改树结构
     *          如果全都结束,通知父节点
     *
     * */

    endMessage(message) {
        //先end自己
        message.end();

        if (message.isAllEnd()) {
            //如果整个子节点都结束了
            this.notifyParentEnd(message);
        } else {
            //如果自己结束了，但是子节点没结束， 说明子节点中有挂的不对的，不应该挂在自己下面，提到自己并列
            if (message.parent) {
                var unEndChildren = message.children.filter(child => !child.isAllEnd());
                message.removeChild.apply(message, unEndChildren);
                message.parent.addChild.apply(message.parent, unEndChildren);
                this.notifyParentEnd(message);
            } else {
                //TODO 重新创建tree
            }
        }
    }

    notifyParentEnd(message) {
        if (message.parent) {
            if (message.parent.isEnd) {
                //如果父节点自己已经结束，再end一次，让父节点判断是否全都结束
                this.endMessage(message.parent);
            } else {
                //什么都不干，等父节点end
            }
        } else {
            //自己就是根节点
            this.sendTree(this.tree);
        }
    }

    sendTree(tree) {

        var serializeBeginTime = new Date();
        try {
            var treeSerialized = tree.serialize();
        } catch (err) {
            logger.error('Send message tree failure. Unsupported error caught. ' + err);
            return;
        }
        var serializeEndTime = new Date();
        debug('Serialize the message tree, cost ' + time.durationInMicros(serializeBeginTime,
            serializeEndTime) + 'us, ' +
            'message tree size ' + treeSerialized.length + ' bytes.');

        sender.send(tree.serialize(), function (err) {
            if (err) {
                logger.error(util.format('Send message tree failure.'), err);
            }
        });
    }

}

module.exports = TreeManager;