var vows = require('vows'),
    assert = require('assert'),
    helper = require('./helper.js');

vows.describe('no-cluster').addBatch({
  'test1': {
    topic: function () {
      callback = this.callback;
      helper.remove_test_file_if_exist();
      helper.launch("no-cluster/test1.js", function(code) {
        callback(null, code);
      });
      setTimeout(function() {
        helper.check_file("no-cluster/output1");
      }, 200);
    },
    
    'end of child': function (code) {
      assert.equal(code, 0);
      helper.check_file("no-cluster/output2");
    }
  }
}).export(module);