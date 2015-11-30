/**
 * middleware for KOA
 * */
var cat = require("./cat");

module.exports = function* (next) {

    this.cat = new cat.CatClass(this);
    yield next;

};