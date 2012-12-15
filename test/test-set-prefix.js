var helper = require('./helper.js'),
    vows = require('vows'),
    assert = require('assert'),
    log4node = require('log4node'),
    util = require('util');

vows.describe('Test ').addBatch({
  'set string prefix': {
    topic: function() {
      var logger = new log4node.Log4Node({
        level: 'info',
        file: 'test.log',
        prefix: '%l '
      });

      logger.info('start');

      var callback = this.callback;
      setTimeout(function() {
        callback(null);
      }, 200);
    },

    check: function(err) {
      assert.ifError(err);
      helper.check_file_content('test.log', 'INFO start\n');
      helper.remove_test_files();
    }
  }
}).addBatch({
  'set function prefix': {
    topic: function() {
      var v = Math.random();
      var logger = new log4node.Log4Node({
        level: 'info',
        file: 'test.log',
        prefix: function(level) {
          return util.format('[ %d ] %s ', v, level.toUpperCase());
        }
      });

      logger.info('start');

      var callback = this.callback;
      setTimeout(function() {
        callback(null, v);
      }, 200);
    },

    check: function(err, v) {
      assert.ifError(err);
      helper.check_file_content('test.log', '[ ' + v + ' ] INFO start\n');
      helper.remove_test_files();
    }
  }

}).export(module);
