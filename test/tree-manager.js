var assert = require("assert");

var TreeManager = require("../lib/message/org/tree-manager");
var Tree = require("../lib/message/org/tree");
var Message = require("../lib/message/message");
var CatEvent = require("../lib/message/event");
var Transaction = require("../lib/message/transaction");
var sender = require('../lib/message/io/sender');

//mock to change TreeManager's sendTree
var mockSendTree = function (tree) {
    tree._mockSend = true;
    tree.root._mockSend = true;
    TreeManager.prototype.sendTree.call(this, tree);
};
//mock sender.send
sender.send = function () {
    return;
};

describe("TreeManager", () => {
    var tm;
    var event;
    var transaction;
    beforeEach(() => {
        tm = new TreeManager();
        tm.sendTree = mockSendTree;
        event = new CatEvent();
        transaction = new Transaction();
    });


    describe("#createTree", () => {
        var tree;
        beforeEach(() => {
            tree = tm.createTree(new Message());
        });

        it("should return a tree", () => {
            assert(tree instanceof  Tree);
        });
        it("should add to trees", () => {
            assert(~tm.trees.indexOf(tree));
        });
    });

    describe("#addMessage", () => {
        it("should send event message immediately when no tree", () => {
            tm.addMessage(event);
            assert(event._mockSend);
        });

        it("should add event message to last node", ()=> {
            tm.addMessage(transaction);
            tm.addMessage(event);
            assert.equal(event._mockSend, undefined);
            assert.equal(event.parent, transaction);
        });

        it("should create tree when transaction message add there is no tree", () => {
            tm.addMessage(transaction);
            assert(tm.trees.length > 0);
            assert(transaction.tree);
            assert.equal(tm.lastNode, transaction);
        });

        it("should add transaction to last node when transaction added", () => {
            tm.addMessage(transaction);
            var trans = new Transaction();
            tm.addMessage(trans);
            assert.equal(trans.parent, transaction);
            assert.equal(tm.lastNode, trans);
        });
    });

    describe("#endMessage", () => {

        it("should end the message", () => {
            tm.addMessage(transaction);
            tm.endMessage(transaction);
            assert.equal(transaction.isEnd, true);
        });

        it("should send tree immediately when root end", () => {
            tm.addMessage(transaction);
            tm.endMessage(transaction);
            assert(transaction._mockSend);
        });

        it("should remove this.tree when tree send", ()=> {
            tm.addMessage(transaction);
            var t = this.tree;
            tm.endMessage(transaction);
            assert.equal(tm.tree, null);
            assert(tm.trees.indexOf(t) == -1);
        });

        it("should move un end children to sibling", () => {
            tm.addMessage(transaction);
            var toEnd = new Transaction();
            tm.addMessage(toEnd);
            var child = new Transaction();
            tm.addMessage(child);
            tm.endMessage(toEnd);
            assert.equal(child.parent, transaction);
        });

        it("should add to its parent when adding a new message after lastNode end", () => {
            tm.addMessage(transaction);
            var last = new Transaction();
            tm.addMessage(last);
            tm.endMessage(last);
            var newM = new CatEvent();
            tm.addMessage(newM);
            assert.equal(newM.parent, transaction);
        });

        it("should create new trees for root's un end children", () => {
            tm.addMessage(transaction);
            var n1 = new Transaction();
            var n2 = new Transaction();
            var n3 = new Transaction();
            var n4 = new Transaction();
            tm.addMessage(n1);
            tm.addMessage(n2);
            tm.addMessage(n3);
            tm.addMessage(n4);
            tm.endMessage(n1);
            tm.endMessage(transaction);

            assert(transaction._mockSend);
            assert.equal(n2.tree , tm.trees[0]);

        });

    });
});