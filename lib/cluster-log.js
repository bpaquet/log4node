var fs = require('fs');

var ClusterLog = exports = module.exports = function ClusterLog(level, filename){
  if ('string' == typeof level) level = exports[level.toUpperCase()];
  this.level = level || exports.DEBUG;
  this.prefix = "[%d] %l "
  if (filename === undefined) {
    this.stream = process.stdout;
    this.filename = null;
  }
  else {
    this.filename = filename;
    this.stream = fs.createWriteStream(filename, {flags: 'a', encoding: 'utf-8'});
  }
  this.stream.on('error', function(err) {
    console.log("Log write error : ", err);
  });
  this.stream.on('close', function() {
    console.log("Log closed");
  });
};

exports.EMERGENCY = 0;
exports.ALERT = 1;
exports.CRITICAL = 2;
exports.ERROR = 3;
exports.WARNING = 4;
exports.NOTICE = 5;
exports.INFO = 6;
exports.DEBUG = 7;

ClusterLog.prototype = {
  
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
      msg = msg.replace(/%d/, new Date().toUTCString()).replace(/%l/, levelStr);
      this.stream.write(msg + '\n');
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
  }

};
