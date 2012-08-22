var log = require('log4node');
log.init('warning');

log.setPrefix("[%l - toto] ");

log.warning("titi1");

setTimeout(function() {
  log.error("titi2")
}, 2000);


