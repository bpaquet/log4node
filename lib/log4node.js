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
    cluster = require('cluster');

var Log4Node = exports = module.exports = function Log4Node(level, filename){
  if ('string' == typeof level) level = exports[level.toUpperCase()];
  this.level = level || exports.DEBUG;
  this.prefix = "[%d] %l "
  if (cluster.isMaster) {
    if (filename === undefined) {
      this.stream = process.stdout;
      process.on('SIGUSR2', function() {
      });
    }
    else {
      this.filename = filename;
      this.reopen();
      var target = this;
      fs.stat(filename, function(err, stats) {
        if (err) {
          throw err;
        }
        process.on('SIGUSR2', function() {
          fs.stat(filename, function(err, stats) {
            if (err) {
              target.reopen();
            }
          });
        });
      });
    }
  }
};

exports.EMERGENCY = 0;
exports.ALERT = 1;
exports.CRITICAL = 2;
exports.ERROR = 3;
exports.WARNING = 4;
exports.NOTICE = 5;
exports.INFO = 6;
exports.DEBUG = 7;

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

  emergency: function(msg){
    this.log('EMERGENCY', arguments);
  },

  alert: function(msg){
    this.log('ALERT', arguments);
  },

  critical: function(msg){
    this.log('CRITICAL', arguments);
  },

  error: function(msg){
    this.log('ERROR', arguments);
  },

  warning: function(msg){
    this.log('WARNING', arguments);
  },

  notice: function(msg){
    this.log('NOTICE', arguments);
  },

  info: function(msg){
    this.log('INFO', arguments);
  },

  debug: function(msg){
    this.log('DEBUG', arguments);
  },

  setup_workers: function() {
    var logger = this;
    Object.keys(cluster.workers).forEach(function(id) {
      cluster.workers[id].on('message', function(msg) {
        if (msg.log) {
          logger.stream.write(msg.log + "\n");
        }
      });
    });
  }
};
