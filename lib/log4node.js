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
  // all levels are also available as function helpers
  // eg: logger.alert('message')
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

function computePrefix(prefix, level) {
  if (typeof prefix === 'function') {
    return prefix(level);
  }
  else {
    return prefix
      .replace(/%d/, new Date().toUTCString())
      .replace(/%l/, level.toUpperCase())
      .replace(/%p/, process.pid);
  }
}

function Log4Node(config) {
  config = config || {};
  if (config.parent) {
    this.parent = config.parent;
    this.setLogLevel(config.level || this.parent.level);
    var child_prefix = config.prefix || '';
    this.prefix = function(level) {
      return computePrefix(this.parent.prefix, level) + computePrefix(child_prefix, level);
    }.bind(this);
    this.id = this.parent.id;
  }
  else {
    this.setLogLevel(config.level);
    this.prefix = config.prefix || "[%d] %l ";
    this.id = config.file || 'stdout';
    loggers[this.id] = this;
    if (cluster.isMaster) {
      if (config.file === undefined) {
        this.stream = process.stdout;
      }
      else {
        this.file = config.file;
        this.reopen();
        sig_listener.on('SIGUSR2', function() {
          this.reopen();
        }.bind(this));
        this.stream.on('error', function(err) {
          console.warn('Unable to write into file : ' + this.file + ' ' + err);
        }.bind(this));
      }
    }
  }
}

Log4Node.prototype.clone = function(config) {
  config = config || {};
  config.parent = this;
  return new Log4Node(config);
}

Log4Node.prototype.reopen = function() {
  if (this.stream) {
    this.stream.end();
  }
  this.stream = fs.createWriteStream(this.file, {flags: 'a', encoding: 'utf-8'});
}

Log4Node.prototype.setPrefix = function(prefix) {
  this.prefix = prefix;
}

Log4Node.prototype.setLogLevel = function(level) {
  if (typeof level === 'string') level = levels[level];
  this.level = level === undefined ? levels.info : level;
}

Log4Node.prototype.getLogLevel = function(level) {
  return this.level;
}

Log4Node.prototype.write = function(msg) {
  if (this.parent) {
    this.parent.write(msg);
  }
  else {
    this.stream.write(msg + '\n');
  }
}

Log4Node.prototype.log = function(level, args) {
  if (levels[level] <= this.level) {
    var i = 1;
    var msg = computePrefix(this.prefix, level);
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
    return defaultLogger[method].apply(defaultLogger, arguments);
  }
});

exports.reconfigure = function(config) {
  return defaultLogger = new Log4Node(config);
}
