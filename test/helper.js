var fs = require('fs'),
    vows = require('vows'),
    assert = require('assert'),
    spawn = require('child_process').spawn;

function launch(command, args, pid_file, callback) {
  var child  = spawn(command, args);
  if (pid_file) {
    fs.writeFileSync('process.pid', child.pid);
  }
  child.stdout.on('data', function (data) {
    console.log('child stdout [' + command + ']: ' + data);
  });
  child.stderr.on('data', function (data) {
    console.log('child stderr [' + command + ']: ' + data);
  });
  child.on('exit', callback);
};

function remove_test_files() {
  fs.readdirSync('.').forEach(function(i) {
    if (i.match(/^test.log.*$/)) {
      fs.unlinkSync(i);
    }
  });
};

function check_file(file, target_file) {
  target_file = target_file || 'test.log';
  content = fs.readFileSync(target_file, 'utf-8');
  regexp = fs.readFileSync(file, 'utf-8');
  if (!content.match(new RegExp("^" + regexp + "$"))) {
    console.log("Content");
    console.log(content);
    console.log("Regexp");
    console.log(regexp);
     assert.fail("File not match");
  }
}

function create_test(name, file_to_launch, final_file, topic_callback, check_callback, test_callback) {
  test_name = file_to_launch.match(/\/([^\/]+)\.js$/)[1]
  test = {}
  test[test_name] = {
    topic: function () {
      remove_test_files();
      test_callback = test_callback || function(f, callback) {
        launch('node', [f], 'process.pid', function(code) {
          callback(null, code);
        });
        if (topic_callback) {
          topic_callback();
        }
      };
      test_callback(file_to_launch, this.callback);
    },
      
    'check_code': function(code) {
      assert.equal(code, 0);
    },

    'check content': function (code) {
      if (final_file) {
        check_file(final_file);
      }
    }

  }
  if (check_callback) {
    test[test_name]['specific_check'] = function(code) {
      check_callback();
    }
  }
  return vows.describe(name).addBatch(test);
}

module.exports = {
  launch: launch,
  remove_test_files: remove_test_files,
  check_file: check_file,
  create_test: create_test
};