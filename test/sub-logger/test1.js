var log = require('../../lib/log4node');

log.reconfigure('warning', 'test.log');

log.setPrefix("%l %p : ");

sublogger1 = log.clone("SUB1 - "),
sublogger2 = log.clone("SUB2 - ");

sublogger1.warning("titi1");

setTimeout(function() {
  sublogger2.error("titi2");
}, 500);

sublogger1.warning("titi3");
