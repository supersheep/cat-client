var Message = require("../lib/message/message");
var assert = require("assert");

describe("Message", function () {
    var message , child, child2;
    beforeEach(function () {
        message = new Message();
        child = new Message();
        child2 = new Message();
    });

    describe("#begin", function () {
        it("should set isBegin to true", function () {
            assert(!message.isBegin);
            message.begin();
            assert(message.isBegin);
        });
    });
    describe("#end", function () {
        it("should set isEnd to true", function () {
            assert(!message.isEnd);
            message.end();
            assert(message.isEnd);
        });
    });

    describe("#addChild", function () {
        beforeEach(function () {
            message.addChild(child, child2);
        });
        it("should add all children to children array", function () {
            assert(message.children.indexOf(child) > -1);
            assert(message.children.indexOf(child2) > -1);
        });
        it("should set child.parent to message", function () {
            assert.equal(child.parent, message);
            assert.equal(child2.parent, message);
        });
    });

    describe("#removeChild", function () {
        beforeEach(function () {
            message.addChild(child, child2);
            message.removeChild(child, child2);
        });

        it("should remove the child in children array", function () {
            assert(message.children.indexOf(child) == -1);
            assert(message.children.indexOf(child2) == -1);
        });
        it("should set child.parent to null", function () {
            assert.equal(child.parent, null);
            assert.equal(child2.parent, null);
        });
    });

    describe("#isAllEnd", function () {
        beforeEach(function () {
            message.addChild(child, child2);
        });

        it("should equals .isEnd when no children", function () {
            message.removeChild(child, child2);
            assert(message.children.length == 0);
            assert.equal(message.isAllEnd(), message.isEnd);
            message.end();
            assert.equal(message.isAllEnd(), message.isEnd);
        });

        it("should return true when self and all children end", function () {
            message.end();
            child.end();
            child2.end();
            assert(message.isAllEnd());
        });
        it("should return false when self not end and all children end", function () {
            child.end();
            child2.end();
            assert(message.children.length == 2);
            assert(!message.isAllEnd());
        });
        it("should return false when self end but any child not end", function () {
            message.end();
            child.end();
            assert(!message.isAllEnd());
        });

        it("should return false when add an un end child", function () {
            var child3 = new Message();
            var child4 = new Message();
            message.addChild(child3);
            assert(!message.isAllEnd());

            message.end();
            child.end();
            child2.end();
            child3.end();
            assert(message.isAllEnd());
            message.addChild(child4);
            assert(!message.isAllEnd());
        });

        it("should return true when self end and add an end child", function () {
            message.end();
            child.end();
            child2.end();
            assert(message.isAllEnd());
            var child3 = new Message();
            child3.end();
            message.addChild(child3);
            assert(message.isAllEnd());
        });

        it("should return false when self end and add an un end child", function () {
            message.end();
            child.end();
            child2.end();
            assert(message.isAllEnd());
            message.addChild(new Message());
            assert(!message.isAllEnd());
        });

        it("should return false when self not end and add any child", function () {
            assert(!message.isAllEnd());
            message.addChild(new Message());
            assert(!message.isAllEnd());
            var c = new Message();
            c.end();
            message.addChild(c);
            assert(!message.isAllEnd())
        });

        it("should return true when remove last un end child", function () {
            message.end();
            child.end();
            assert(!message.isAllEnd());
            message.removeChild(child2);
            assert(message.isAllEnd());
        });
        it("should return true when remove last un end child but self not end", function () {
            child.end();
            assert(!message.isAllEnd());
            message.removeChild(child2);
            assert(!message.isAllEnd());
        });

        it("should return false when remove an un end child but not last", function () {
            message.end();
            assert(!message.isAllEnd());
            message.removeChild(child);
            assert(!message.isAllEnd());
        });
        it("should return false when remove all children but self not end", function () {
            message.removeChild(child, child2);
            assert(!message.isAllEnd());
        });

    });


});