var helper = require('./helper.js');

helper.create_test('sub-logger', 'sub-logger/test1.js', 'sub-logger/output2', function() {
  setTimeout(function() {
    helper.check_file("sub-logger/output1");
  }, 200);
}).export(module);
