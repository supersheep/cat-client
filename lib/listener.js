/**
 * middleware for KOA
 * */
var cat = require("./index");

module.exports = function*(next) {

    this.cat = new cat.Cat(this);
    yield next;

};