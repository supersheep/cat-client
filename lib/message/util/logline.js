var BufferBuilder = require("buffer-builder");
var escape = require('js-string-escape');


/**
 * 拼装cat log view的一行内容
 * return Buffer
 * */
module.exports = function (columns) {
    var bf = new BufferBuilder();
    var l = columns.length;

    columns.forEach((elem, i) => {
        //var s = (elem !== undefined && elem !== null && elem!=="") ? escape(elem) : '';
        var s = elem?elem:""
        bf.appendString(s);
        if (i < l - 1) {
            bf.appendString('\t');
        }
    });
    bf.appendString("\n");
    return bf.get();
};