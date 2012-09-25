var helper = require('./helper.js'),
    fs = require('fs');

helper.create_test('cluster-stdout-sig', 'cluster-stdout-sig/test1.js', null, function() {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.launch("kill", ['-USR2', fs.readFileSync('process.pid')], null, function(code) {
       assert.equal(code, 0);
     });
    }, 500);
  });
}, function(stdout) {
  helper.check_content(stdout, 'cluster-stdout-sig/output1');
}).export(module);
