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
    events = require('events');

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

var Log4Node = exports = module.exports = function Log4Node(level, filename){
  if ('string' == typeof level) level = exports[level.toUpperCase()];
  this.level = level || exports.DEBUG;
  this.prefix = "[%d] %l "
  if (cluster.isMaster) {
    if (filename === undefined) {
      this.stream = process.stdout;
///////////////public constant////////////////
exports.ERROR   = 1;
exports.WARNING = 2;
exports.INFO    = 3;
exports.DEBUG   = 4;
    }
    else {
      this.filename = filename;
      this.reopen();
      var target = this;
      fs.stat(filename, function(err, stats) {
        if (err) {
          throw err;
        }
        sig_listener.on('SIGUSR2', function() {
          fs.stat(filename, function(err, stats) {
            if (err) {
              target.reopen();
            }
          });
        });
      });
    }
    var logger = this;
    child_listener.on('online', function(worker) {
      worker.on('message', function(msg) {
        if (msg.log) {
          logger.stream.write(msg.log + "\n");
        }
      });
    });
  }
};


Log4Node.prototype = {

  reopen: function() {
    if (this.stream) {
      this.stream.end();
    }
    this.stream = fs.createWriteStream(this.filename, {flags: 'a', encoding: 'utf-8'});
  },

  set_prefix: function(prefix) {
    this.prefix = prefix;
  },

  set_loglevel: function(levelStr) {
    this.level = exports[levelStr.toUpperCase()];
  },

  log: function(levelStr, args) {
    if (exports[levelStr] <= this.level) {
      var i = 1;
      var msg = this.prefix + args[0].replace(/%s/g, function(){
        return args[i++];
      });
      msg = msg.replace(/%d/, new Date().toUTCString()).replace(/%l/, levelStr).replace(/%p/, process.pid);
      if (cluster.isMaster) {
        this.stream.write(msg + "\n");
      }
      else {
        process.send({log: msg});
      }
    }
  },


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




};
