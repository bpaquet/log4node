var helper = require('./helper.js');

helper.create_test('cluster-logrotate', 'cluster-logrotate/test1.js', 'cluster-logrotate/output2', function() {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.check_file("cluster-logrotate/output1");
      helper.launch(logrotate, ['-f', 'cluster-logrotate/logrotate.conf', '-s', '/tmp/s'], null, function(code) {});
    }, 500);
  });
}, function() {
  helper.check_file("cluster-logrotate/output1", "test.log.1");
}).export(module);
var helper = require('./helper.js');

helper.create_test('cluster', 'cluster/test1.js', 'cluster/output1', function() {}).export(module);
