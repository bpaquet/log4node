var helper = require('./helper.js');

helper.create_test('sub-logger-default', 'sub-logger-default/test1.js', 'sub-logger-default/output2', function() {
  setTimeout(function() {
    helper.check_file("sub-logger-default/output1");
  }, 200);
}).export(module);


