# Overview

This module is designed to be used with Node Cluster in production:
* one log file for all workers
* compatible with logrotate: an USR2 signal reopen the log file

This module is compatible with node 0.8.x. For the node 0.6.x, please use version 0.0.1 of this module.

This module is inspired from [this module](https://github.com/visionmedia/log.js).

# How to use it

## Installation

    npm install log4node

## Usage

Default logger:

    var log = require('log4node');

    log.error("this is a log");

Will output to console.

Note: you can reconfigure default logger by calling

    log.reconfigure('info', 'toto.log');

Will now write into `toto.log`

Your custom logger:

    var log4node = require('log4node');
        log = new log4node.Log4Node('warning', 'test.log');

    log.error("this is a log");
    log.debug("this is a debug log");

## Log level

Log level can be adjusted for each logger:

    log.setLogLevel('info');

Log level for default logger is 'info'.

Available log levels are:

* emergency
* alert
* critical
* error
* warning
* notice
* info
* debug

## Prefix

Prefix of log lines can be changed:

    log.setPrefix("%d - %p ");

You can use following field in prefix:
* `%d`: current date
* `%p`: current process id
* `%l`: log level

Default prefix is: `[%d] %l `

## Cluster mode

Workers processes will send logs to the cluster master for writing to file.

Setup is fully transparent for developper.

A full example can be found [here](https://github.com/bpaquet/log4node/blob/master/test/cluster/test1.js).

## Repoen log file

Just send USR2 signal to node process, or, in cluster mode, to master node process:

    kill -USR2 pid

Example of logrotate file:

    /var/log/node.log {
      rotate 5
      weekly
      postrotate
        kill -USR2 `cat process.pid`
      endscript
    }

## Create a specialized logger
This feature is provided to specialize a logger for a sub-component.
You can create a new logger with its own level and prefix for a sub-component.
The logs will be send to the same files with a prefix.

    log = new log4node.Log4Node('warning', 'test.log');
    sublogger1 = log.clone("SUBMODULE - ", 'error');

or with the default logger

    sublogger1 = log4node.clone("SUBMODULE - ", 'error'),

# License

Copyright 2012 Bertrand Paquet

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
