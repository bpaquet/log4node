var helper = require('./helper.js'),
    vows = require('vows'),
    assert = require('assert'),
    Log4Node = require('log4node');

vows.describe('Test strange params').addBatch({
  'when calling log.info': {
    'topic': function() {
      var logger = new Log4Node('info', 'test.log');
      logger.setPrefix('');

      logger.info('log me baby', 2, 5);
      logger.info(undefined);
      logger.info(null);

      var callback = this.callback;
      setTimeout(function() {
        callback(null);
      }, 200);
    },
    'check': function(err) {
      assert.ifError(err);
      helper.check_file_content('test.log', 'log me baby 2 5\nundefined\nnull\n');
      helper.remove_test_files();
    }
  }
}).export(module);

