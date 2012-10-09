var helper = require('./helper.js');

helper.create_test('no-cluster-logrotate', 'no-cluster-logrotate/test1.js', 'no-cluster-logrotate/output2', function() {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.check_file("no-cluster-logrotate/output1");
      helper.launch(logrotate, ['-f', 'no-cluster-logrotate/logrotate.conf', '-s', '/tmp/s'], null, function(code) {});
    }, 200);
  });
}, function() {
  helper.check_file("no-cluster-logrotate/output1", "test.log.1");
}).export(module);
