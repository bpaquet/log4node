# Overview

This module is designed to be used with Node Cluster in production:
* one log file for all workers
* compatible with logrotate : an HUP signal reopen the log file

This module is inspired from [this module](https://github.com/visionmedia/log.js).

# How to use it

## Installation

    npm install cluster-log
  
## Usage

    var ClusterLog = require('cluster-log'),
        log = new ClusterLog('warning', 'test.log');

    log.error("this is a log");
    log.debug("this is a debug log");

## Prefix

Prefix of log lines can be changed:

    log.set_prefix("%d - %p ");

You can use following field in prefix:
* `%d` : current date
* `%p` : current process id
* `%l` : log level

Default prefix is: `[%d] %l `
    
## Cluster mode

After creating worker, just call:

    var worker = cluster.fork();
    log.setup_worker(worker);
    
A full example can be found [here](https://github.com/bpaquet/cluster-log/blob/master/test/cluster/test1.js).

## Repoen log file

Just send HUP signal to node process, or, in cluster mode, to master node process:

    kill -HUP pid
    
Example of logrotate file:

    /var/log/node.log {
      rotate 5
      weekly
      postrotate
        kill -HUP `cat process.pid`
      endscript
    }
    
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
