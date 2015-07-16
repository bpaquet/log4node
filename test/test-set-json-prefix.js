var helper = require('./helper.js'),
    vows = require('vows'),
    assert = require('assert'),
    log4node = require('log4node'),
    util = require('util');

vows.describe('Test ').addBatch({
  'set function prefix merged with string': {
    topic: function() {
      var v = Math.random();
      var logger = new log4node.Log4Node({
        level: 'info',
        file: 'test.log',
        json: true,
        prefix: function(level) {
          return {log_level: level.toUpperCase(), id: v};
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
      helper.check_file_content('test.log',
                                JSON.stringify({log_level: "INFO", id: v, message: "start"}) + "\n");
      helper.remove_test_files();
    }
  },
}).addBatch({
  'set function prefix inheritance with function': {
    topic: function() {
      var v = Math.random();
      var parent_logger = new log4node.Log4Node({
        level: 'info',
        file: 'test.log',
        json: true,
        prefix: function(level) {
          return {log_level: level.toUpperCase(), id: v};
        }
      });

      var logger = new log4node.Log4Node({parent: parent_logger,
                                          prefix: function() { return {test: 1, id: "child"}; }});

      logger.info({domain: "test.com"});

      var callback = this.callback;
      setTimeout(function() {
        callback(null, v);
      }, 200);
    },

    check: function(err, v) {
      assert.ifError(err);
      helper.check_file_content('test.log',
                                JSON.stringify({log_level: "INFO",
                                                id: "child",
                                                test: 1,
                                                domain: "test.com"}) + "\n");
      helper.remove_test_files();
    }
  },
}).addBatch({
  'set function prefix with no prefix': {
    topic: function() {
      var v = Math.random();
      var logger = new log4node.Log4Node({
        level: 'info',
        file: 'test.log',
        json: true,
        prefix: function(level) {
          return null;
        }
      });

      logger.info({domain: "test.com"});

      var callback = this.callback;
      setTimeout(function() {
        callback(null, v);
      }, 200);
    },

    check: function(err, v) {
      assert.ifError(err);
      helper.check_file_content('test.log',
                                JSON.stringify({domain: "test.com"}) + "\n");
      helper.remove_test_files();
    }
  },
}).addBatch({
  'set no prefix, use default': {
    topic: function() {
      var v = Math.random();
      var logger = new log4node.Log4Node({
        level: 'info',
        file: 'test.log',
        json: true
      });

      logger.info({domain: "test.com"});

      var callback = this.callback;
      setTimeout(function() {
        callback(null, v);
      }, 200);
    },

    check: function(err, v) {
      assert.ifError(err);
      helper.check_file_content('test.log',
                                JSON.stringify({
                                  date: new Date().toUTCString(),
                                  log_level: "INFO",
                                  pid: process.pid,
                                  domain: "test.com"}) + "\n");
      helper.remove_test_files();
    }
  },
}).export(module);
