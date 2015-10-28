var log = function(msg) {
    console.log(msg);
}

module.exports = {
    error: log,
    fatal: log,
    info: log,
    warn: log
}
