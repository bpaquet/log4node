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

var
  loggers = {},

  // levels are accessible through the exports object in uppercase
  // eg: exports.EMERGENCY === 0
  levels = {
  'emergency':  0,
  'alert':      1,
  'critical':   2,
  'error':      3,
  'warning':    4,
  'notice':     5,
  'info':       6,
  'debug':      7
}

var sig_listener = new events.EventEmitter();
sig_listener.setMaxListeners(0);

process.on('SIGUSR2', function() {
  sig_listener.emit('SIGUSR2');
});

cluster.on('online', function(worker) {
  worker.on('message', function(msg) {
    if (msg.log && msg.logger_id && loggers[msg.logger_id]) {
      loggers[msg.logger_id].write(msg.log);
    }
  })
});

function Log4Node(level, filename) {
  this.id = (filename || 'stdout');
  this.setLogLevel(level);
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

Log4Node.prototype.reopen = function() {
  if (this.stream) {
    this.stream.end();
  }
  this.stream = fs.createWriteStream(this.filename, {flags: 'a', encoding: 'utf-8'});
}

Log4Node.prototype.setPrefix = function(prefix) {
  this.prefix = prefix;
}

Log4Node.prototype.setLogLevel = function(level) {
  if (typeof level === 'string') level = levels[level.toUpperCase()];
  this.level = level === undefined ? levels.info : level;
}

Log4Node.prototype.write = function(msg) {
  this.stream.write(msg + '\n');
}

Log4Node.prototype.log = function(level, args) {
  if (levels[level] <= this.level) {
    var i = 1;
    var msg = this.prefix;
    msg = msg.replace(/%d/, new Date().toUTCString()).replace(/%l/, level.toUpperCase()).replace(/%p/, process.pid);
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

// exports
exports.Log4Node = Log4Node;

Object.keys(levels).forEach(function(level) {
  // Log4Node.INFO|DEBUG..
  exports[level.toUpperCase()] = levels[level];

  // Log4Node.prototype.info|debug..
  Log4Node.prototype[level] = function() {
    this.log(level, arguments);
  }
});

// set easy defaultLogger
// allows require('Log4Node').info('')|debug('')..
var defaultLogger = new Log4Node();

Object.keys(Log4Node.prototype).forEach(function(method) {
  exports[method] = function() {
    defaultLogger[method].apply(defaultLogger, arguments);
  }
});

exports.reconfigure = function(level, filename) {
  defaultLogger = new Log4Node(level, filename);
}
