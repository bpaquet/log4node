var Log4Node = require('log4node'),
    log = new Log4Node('warning', 'test.log');

log.setPrefix("%l - ");

log.warning("titi1");

