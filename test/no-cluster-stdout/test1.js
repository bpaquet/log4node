var Log4Node = require('log4node'),
    log = new Log4Node('warning');

log.set_prefix("[%l - toto] ");

log.warning("titi1");

setTimeout(function() {
  log.error("titi2")
}, 2000);


