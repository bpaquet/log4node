// Copyright 2012 Bertrand Paquet
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var fs = require('fs'),
    cluster = require('cluster'),
    events = require('events'),
    util = require('util');

var sig_listener = new events.EventEmitter();
sig_listener.setMaxListeners(0);

process.on('SIGUSR2', function() {
  sig_listener.emit('SIGUSR2');
});

var child_listener = new events.EventEmitter();
child_listener.setMaxListeners(0);

cluster.on('online', function(worker) {
  child_listener.emit('online', worker);
});

///////////////public constant////////////////
exports.ERROR   = 1;
exports.WARNING = 2;
exports.INFO    = 3;
exports.DEBUG   = 4;

///////////////private////////////////
var
    level       = exports.DEBUG,
    prefix      = "[%d] %l ",
    filename,
    initialized = false,
    stream      = process.stdout,
    times       = {
      'ERROR'   : [],
      'WARNING' : [],
      'INFO'    : [],
      'DEBUG'   : []
    };

function reopen () {
  if (stream !== process.stdout) {
    stream.end();
  }
  stream = fs.createWriteStream(filename, {flags: 'a', encoding: 'utf-8'});
}

//wrapper around the standart format function
function format() {
    return util.format.apply(this, arguments[0]);
}

function log (levelStr, msg) {
  if (exports[levelStr] <= level) {
    msg = prefix + msg;
    msg = msg.replace(/%d/, new Date().toUTCString()).replace(/%l/, levelStr).replace(/%p/, process.pid);

    if (cluster.isMaster) {
      stream.write(msg + "\n");
    }
    else {
      process.send({log: msg});
    }
  }
}

///////////////public////////////////
exports.init = function(lvl, fname){
  if (lvl && exports[lvl.toUpperCase()]) {
    level = exports[lvl.toUpperCase()];
  }

  if (cluster.isMaster) {
    if (fname) {
      filename = fname;
      reopen();
      fs.stat(filename, function(err, stats) {
        if (err) {
          throw err;
        }
        sig_listener.on('SIGUSR2', function() {
          fs.stat(filename, function(err, stats) {
            if (err) {
              reopen();
            }
          });
        });
      });
    }

    child_listener.on('online', function(worker) {
      worker.on('message', function(msg) {
        if (msg.log) {
          stream.write(msg.log + "\n");
        }
      });
    });
  }
  initialized = true;
};

exports.setPrefix = function(pfix) {
  prefix = pfix;
};

exports.setLogLevel = function(levelStr) {
  level = exports[levelStr.toUpperCase()];
};

exports.error = function(msg){
  log('ERROR', format(arguments));
};

exports.warning = function(msg){
  log('WARNING', format(arguments));
};

exports.info = function(msg){
  log('INFO', format(arguments));
};

exports.debug = function(msg){
  log('DEBUG', format(arguments));
};

///////// extra function inspired by console //////////////

var extraFunction = ['error', 'warning', 'info', 'debug'],
i , len = extraFunction.length, lvl;

function time (label, level) {
  times[level][label] = Date.now();
}

function timeEnd(label, level) {
  var time = times[level][label];
  if (!time) {
    throw new Error('No such label: ' + label);
  }
  var duration = Date.now() - time;
  log(level, util.format('%s: %dms', label, duration));
}

function trace(label, level) {
  var err = new Error();
  err.name = 'Trace';
  err.message = label || '';
  Error.captureStackTrace(err, arguments.callee);
  log(level, err.stack);
}

function dir(obj, level) {
  if (stream === process.stdout) {
    //add color
    log(level, util.inspect(obj, false, 2, true));
  }
  else {
    log(level, util.inspect(obj));
  }
}

function addConsoleFunction(level) {
  exports[level].time      = function (label) {time(label, level.toUpperCase());};
  exports[level].timeEnd   = function (label) {timeEnd(label, level.toUpperCase());};
  exports[level].trace     = function (label) {trace(label, level.toUpperCase());};
  exports[level].dir       = function (obj)   {dir(obj, level.toUpperCase());};
}

for (i = 0; i < len; i ++) {
  addConsoleFunction(extraFunction[i]);
}
