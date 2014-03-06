process.env.DISABLE_LOG4NODE_IPC = 1;

var cluster = require('cluster'),
    log4node = require('log4node'),
    log = new log4node.Log4Node({level: 'warning', file: 'test.log'});

log.setPrefix("%l %p : ");

if (cluster.isMaster) {
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  log.error("Master started");

  cluster.on('exit', function(worker) {
    log.error('Worker ' + worker.process.pid + ' died');
  });
} else {
  // will not be printed : no_ipc, and logger not initialized
  log.error('toto');
  setTimeout(function() {
    log.error("Hello, I'm a worker");
    setTimeout(function() {
      process.exit();
    }, 2000);
  }, 200);
}
