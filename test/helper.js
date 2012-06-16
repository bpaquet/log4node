var fs = require('fs'),
    assert = require('assert'),
    spawn = require('child_process').spawn;

exports.launch = function(file_to_launch, callback) {
  var child  = spawn("node", [file_to_launch]);
  child.on('exit', callback);
};

exports.remove_test_file_if_exist = function () {
  try {
    fs.lstatSync('test.log');
    fs.unlinkSync('test.log');
  }
  catch (err) {
  }
};

exports.check_file = function(file) {
  assert.equal(fs.readFileSync('test.log', 'utf-8'), fs.readFileSync(file, 'utf-8'));
}