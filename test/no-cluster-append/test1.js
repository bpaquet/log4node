var Log4Node = require('log4node'),
    log = new Log4Node('warning', 'test.log');

log.set_prefix("%l - ");

log.warning("titi1");

