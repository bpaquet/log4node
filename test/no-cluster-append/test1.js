var ClusterLog = require('cluster-log'),
    log = new ClusterLog('warning', 'test.log');

log.set_prefix("%l - ");

log.warning("titi1");

