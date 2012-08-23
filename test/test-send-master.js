var cluster = require('cluster'),
    vows = require('vows'),
    assert = require('assert'),
    Log4Node = require('log4node');

vows.describe('Test process.send').addBatch({
  'is not called when a worker process is disconnected': {
    'topic': function() {
      // setup process as a worker process
      cluster.isMaster = false;
      var calls = 0;
      process.send = function(args) {
        calls ++;
      };

      var logger = new Log4Node('info');

      process.connected = true;

      logger.info('log me baby');
      logger.info('log me baby 2 times');

      // when disconnected (ie, master dies)
      process.connected = false;

      logger.info('log me baby');

      return calls;
    },
    'check': function(calls) {
      assert.equal(calls, 2);
    }
  }
}).export(module);

