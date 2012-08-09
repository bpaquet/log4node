var Log4Node = require('log4node'),
    log = new Log4Node('warning', 'test.log');

log.setPrefix("[%l - toto] ");

log.warning("titi1");
log.info("toto2");

setTimeout(function() {
  log.error("titi4")
  log.debug("toto5");
  log.setLogLevel("debug");
  log.debug("toto6");
}, 500);

log.warning("titi3");

