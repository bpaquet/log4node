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
    util = require('util'),
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
    }
    else {
      this.filename = filename;
      this.reopen();
      sig_listener.on('SIGUSR2', function() {
        fs.exists(filename, function(exists) {
          if (! exists) {
            this.reopen();
          }
        }.bind(this));
      }.bind(this));
      this.stream.on('error', function(err) {
        console.warn('Unable to write into file : ' + filename + ' ' + err);
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

  setPrefix: function(prefix) {
    this.prefix = prefix;
  },

  setLogLevel: function(levelStr) {
    this.level = exports[levelStr.toUpperCase()];
  },

  log: function(levelStr, args) {
    if (exports[levelStr] <= this.level) {
      var i = 1;
      var msg = this.prefix;
      msg = msg.replace(/%d/, new Date().toUTCString()).replace(/%l/, levelStr).replace(/%p/, process.pid);
      msg += util.format.apply(this, args);
      if (cluster.isMaster) {
        this.stream.write(msg + '\n');
      }
      else {
        // do no try to send a message to master if disconnected
        // because in this case node will emit an error event
        if (process.connected) {
          process.send({log: msg});
        }
      }
    }
  },

  emergency: function(){
    this.log('EMERGENCY', arguments);
  },

  alert: function(){
    this.log('ALERT', arguments);
  },

  critical: function(){
    this.log('CRITICAL', arguments);
  },

  error: function(){
    this.log('ERROR', arguments);
  },

  warning: function(){
    this.log('WARNING', arguments);
  },

  notice: function(){
    this.log('NOTICE', arguments);
  },

  info: function(){
    this.log('INFO', arguments);
  },

  debug: function(msg){
    this.log('DEBUG', arguments);
  },

};
