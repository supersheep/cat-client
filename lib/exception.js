'use strict';

var util = require('util');

function CatError(message) {
    this.message = util.format(message);
}

function CatFatal(message) {
    this.message = util.format(message);
}

module.exports = {
    CatError: CatError,
    CatFatal: CatFatal
};
