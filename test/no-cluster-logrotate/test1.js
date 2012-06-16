var ClusterLog = require('cluster-log'),
    log = new ClusterLog('warning', 'test.log');

log.set_prefix("[%l - toto] ");

log.warning("titi1");

setTimeout(function() {
  log.error("titi2")
}, 1000);


