var log4node = require('../../lib/log4node'),
    log = new log4node.Log4Node('warning', 'test.log'),
    sublogger1 = new log4node.Log4Node('warning', null, log),
    sublogger2 = new log4node.Log4Node('warning', null, log);

sublogger1.setPrefix("SUB1 - ");
sublogger2.setPrefix("SUB2 - ");

sublogger1.warning("titi1");

setTimeout(function() {
  sublogger2.error("titi2");
}, 500);

sublogger1.warning("titi3");
