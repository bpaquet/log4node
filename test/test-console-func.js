var vows = require('vows'),
    stream = require('stream'),
    assert = require('assert');
    log = require('../lib/log4node');

var val, log;

vows.describe("test-console-func").addBatch({
  'test-console': {
    'topic' : function () {
      return null;
    },

    'log.time and log.timeEnd' : function (t) {
      process.stdout.once('data', function (msg) {
        assert(/\d+ms/.test(val));
      });

      log.debug.time('100-elements');
      for (var i = 0; i < 100; i++) {
        ;
      }
      log.debug.timeEnd('100-elements');
    },

    'log.trace' : function (t) {
      process.stdout.once('data', function (msg) {
        assert(/SUPER TRACE\s+at g.+at f/.test(msg));
      });

      function g(){
          log.debug.trace("SUPER TRACE");
        }
          function f() {
        g();
      }
      f();
    },

    'log.dir' : function (t) {
      process.stdout.once('data', function (msg) {
        assert.equal(val, "{ a: 1, b: 2, c: [Function]");
      });
      log.debug.dir({"a" : 1, "b" : 2, "c" : function () {}});
    }
  }
})
.export(module); // Run it
