var helper = require('./helper.js');

helper.create_test('cluster-sub-logger-logrotate', 'cluster-sub-logger-logrotate/test1.js', 'cluster-sub-logger-logrotate/output2', function() {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.check_file("cluster-sub-logger-logrotate/output1");
      helper.launch(logrotate, ['-f', 'cluster-sub-logger-logrotate/logrotate.conf', '-s', '/tmp/s'], null, function(code) {});
    }, 500);
  });
}, function() {
  helper.check_file("cluster-sub-logger-logrotate/output1", "test.log.1");
}).export(module);
