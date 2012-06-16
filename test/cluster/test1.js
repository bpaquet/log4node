var cluster = require('cluster'),
    Log4Node = require('log4node'),
    log = new Log4Node('warning', 'test.log');

log.set_prefix("%l %p : ");

if (cluster.isMaster) {
  for (var i = 0; i < 4; i++) {
    var worker = cluster.fork();
    log.setup_worker(worker);
  }

  log.error("Master started");

  cluster.on('death', function(worker) {
    log.error('Worker ' + worker.pid + ' died');
  });

} else {
  log.error("Hello, I'm a worker");
  setTimeout(function() {
    process.exit();
  }, 100);
}
