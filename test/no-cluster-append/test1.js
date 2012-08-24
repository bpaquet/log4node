var log4node = require('log4node'),
    log = new log4node.Log4Node('warning', 'test.log');

log.setPrefix("%l - ");

log.warning("titi1");

