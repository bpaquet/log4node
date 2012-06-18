var cluster = require('cluster'),
    Log4Node = require('log4node'),
    log = new Log4Node('warning', 'test.log');

log.set_prefix("%l %p : ");

if (cluster.isMaster) {
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  log.error("Master started");

  cluster.on('exit', function(worker) {
    log.error('Worker ' + worker.process.pid + ' died');
  });

} else {
  log.error("Hello, I'm a worker");
  setTimeout(function() {
    process.exit();
  }, 100);
}
