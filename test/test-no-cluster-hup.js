var helper = require('./helper.js'),
    assert = require('assert'),
    fs = require('fs');

helper.create_test('no-cluster-hup', 'no-cluster-hup/test1.js', 'no-cluster-hup/output2', function() {
  setTimeout(function() {
    helper.check_file("no-cluster-hup/output1");
    helper.launch("kill", ['-HUP', fs.readFileSync('process.pid')], null, function(code) {
      assert.equal(code, 0);
    });
  }, 200);
}).export(module);
