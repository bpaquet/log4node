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

var loggers = {};

cluster.on('online', function(worker) {
  worker.on('message', function(msg) {
    if (msg.log && msg.logger_id && loggers[msg.logger_id]) {
      loggers[msg.logger_id].write(msg.log);
    }
  })
});

function Log4Node(level, filename) {
  if ('string' == typeof level) level = exports[level.toUpperCase()];
  this.level = level || exports.INFO;
  this.id = (filename || 'stdout');
  loggers[this.id] = this;
  this.prefix = "[%d] %l ";
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
  }
}

exports.Log4Node = Log4Node;

exports.EMERGENCY = 0;
exports.ALERT = 1;
exports.CRITICAL = 2;
exports.ERROR = 3;
exports.WARNING = 4;
exports.NOTICE = 5;
exports.INFO = 6;
exports.DEBUG = 7;

Log4Node.prototype.reopen = function() {
  if (this.stream) {
    this.stream.end();
  }
  this.stream = fs.createWriteStream(this.filename, {flags: 'a', encoding: 'utf-8'});
}

Log4Node.prototype.setPrefix = function(prefix) {
  this.prefix = prefix;
}

Log4Node.prototype.setLogLevel = function(levelStr) {
  this.level = exports[levelStr.toUpperCase()];
}

Log4Node.prototype.write = function(msg) {
  this.stream.write(msg + '\n');
}

Log4Node.prototype.log = function(levelStr, args) {
  if (exports[levelStr] <= this.level) {
    var i = 1;
    var msg = this.prefix;
    msg = msg.replace(/%d/, new Date().toUTCString()).replace(/%l/, levelStr).replace(/%p/, process.pid);
    msg += util.format.apply(this, args);
    if (cluster.isMaster) {
      this.write(msg);
    }
    else {
      // do no try to send a message to master if disconnected
      // because in this case node will emit an error event
      if (process.connected) {
        process.send({log: msg, logger_id: this.id});
      }
    }
  }
}

Log4Node.prototype.emergency = function(){
  this.log('EMERGENCY', arguments);
}

Log4Node.prototype.alert = function(){
  this.log('ALERT', arguments);
}

Log4Node.prototype.critical = function(){
  this.log('CRITICAL', arguments);
}

Log4Node.prototype.error = function(){
  this.log('ERROR', arguments);
}

Log4Node.prototype.warning = function(){
  this.log('WARNING', arguments);
}

Log4Node.prototype.notice = function(){
  this.log('NOTICE', arguments);
}

Log4Node.prototype.info = function(){
  this.log('INFO', arguments);
}

Log4Node.prototype.debug = function(){
  this.log('DEBUG', arguments);
}

// setup default logger
var defaultLogger = new Log4Node;

[
  'log',
  'emergency',
  'alert',
  'critical',
  'error',
  'warning',
  'notice',
  'info',
  'debug',
  'setPrefix',
  'setLogLevel'
].forEach(function (method) {
  exports[method] = function () {
    return defaultLogger[method].apply(defaultLogger, arguments);
  };
});

exports.reconfigure = function(level, filename) {
  defaultLogger = new Log4Node(level, filename);
}
