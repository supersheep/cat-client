var log = require('@dp/logger')('Cat');

module.exports = function (file_name) {
	var file = '(' + file_name + ') ';
	return {
		error: function (msg) {
			log.error(file + msg);
		},
		info: function (msg) {
			log.info(file + msg);
		},
		warn: function (msg) {
			log.warn(file + msg);
		}
	}
};