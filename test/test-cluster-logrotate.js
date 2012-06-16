var helper = require('./helper.js');

helper.create_test('cluster-logrotate', 'cluster-logrotate/test1.js', 'cluster-logrotate/output2', function() {
  setTimeout(function() {
    helper.check_file("cluster-logrotate/output1");
    helper.launch("/usr/local/sbin/logrotate", ['-f', 'cluster-logrotate/logrotate.conf'], null, function(code) {});
  }, 500);
}, function() {
  helper.check_file("cluster-logrotate/output1", "test.log.1");
}).export(module);
