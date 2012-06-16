var helper = require('./helper.js');

helper.create_test('no-cluster', 'no-cluster/test1.js', 'no-cluster/output2', function() {
  setTimeout(function() {
    helper.check_file("no-cluster/output1");
  }, 200);
}).export(module);
