var Log4Node = require('log4node'),
    log = new Log4Node('warning', 'test.log');

log.setPrefix("[%l - toto] ");

log.warning("titi1");

setTimeout(function() {
  log.error("titi2")
}, 2000);


