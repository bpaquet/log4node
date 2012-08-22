var log = require('log4node');
log.init('warning', 'test.log');

log.setPrefix("%l - ");

log.warning("titi1");

