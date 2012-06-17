var helper = require('./helper.js'),
    assert = require('assert'),
    fs = require('fs');

helper.create_test('no-cluster-stdout', 'no-cluster-stdout/test1.js', null, function() {
  setTimeout(function() {
    helper.launch("kill", ['-USR2', fs.readFileSync('process.pid')], null, function(code) {
      assert.equal(code, 0);
    });
  }, 200);
}).export(module);
