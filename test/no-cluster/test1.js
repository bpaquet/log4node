var ClusterLog = require('cluster-log'),
    log = new ClusterLog('warning', 'test.log');

log.set_prefix("[%l - toto] ");

log.warning("titi1");
log.info("toto2");

setTimeout(function() {
  log.error("titi4")
  log.debug("toto5");
  log.set_loglevel("debug");
  log.debug("toto6");
}, 500);

log.warning("titi3");

