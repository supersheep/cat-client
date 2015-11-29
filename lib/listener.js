/**
 * middleware for KOA
 * */
var cat = require("./index");

module.exports = function*(next) {

    this.cat = new cat(this);
    yield next;

};