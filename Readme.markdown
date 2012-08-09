# Overview

This module is designed to be used with Node Cluster in production:
* one log file for all workers
* compatible with logrotate : an USR2 signal reopen the log file

This module is compatible with node 0.8.x. For the node 0.6.x, please use version 0.0.1 of this module.

This module is inspired from [this module](https://github.com/visionmedia/log.js) and the [console API](http://nodejs.org/api/stdio.html).

# How to use it

## Installation

    npm install log4node

## Usage

###initialization

```js
var log = require('log4node'),

//should be called only once for a program
log.init('debug', 'test.log');
```

###classical methods

The methods `error`, `warning`, `info` and `debug` are similar to `console.log`.

```js
log.error("this is an error message");
// [Wed, 02 May 2012 16:01:14 GMT] ERROR this is an error message

log.warning("this is a warning message");
// [Wed, 02 May 2012 16:01:14 GMT] WARNING this is a warning message

log.info("this is an info");
// [Wed, 02 May 2012 16:01:14 GMT] INFO this is an info

log.debug("this is a debug message");
// [Wed, 02 May 2012 16:01:14 GMT] DEBUG this is a DEBUG

log.debug("%j", {"a" : 1, "b" : 2, "c" : 3});
// [Wed, 02 May 2012 16:01:14 GMT] DEBUG {"a":1,"b":2,"c":3}

log.debug('%s:%s', 'foo', 'bar', 'baz');
// [Wed, 02 May 2012 16:01:14 GMT] DEBUG foo:bar baz
```

###extra methods from console
You can also use the function `time`, `timeEnd`, `trace`, `dir`that come from the console API.

*time and timeEnd*
```js
log.debug.time('100-elements');
for (var i = 0; i < 100; i++) {
  ;
}
log.debug.timeEnd('100-elements');
// [Wed, 02 May 2012 16:01:14 GMT] DEBUG 100-elements: 1156ms
```

*trace*
```js
function g() {
  log.debug.trace("SUPER TRACE");
}
function f() {
  g();
}
f();
/*-> [Wed, 02 May 2012 16:01:14 GMT] DEBUG Trace: SUPER TRACE
        at g (repl:3:9)
        at f (repl:5:1)
        ...
*/
```

*dir*
```js
log.debug.dir({"a" : 1, "b" : 2, "c" : function () {}});
// [Wed, 02 May 2012 16:01:14 GMT] DEBUG { a: 1, b: 2, c: [Function] }
```
## Prefix

Prefix of log lines can be changed:

    log.setPrefix("%d - %p ");

You can use following field in prefix:
* `%d` : current date
* `%p` : current process id
* `%l` : log level

Default prefix is: `[%d] %l `

## Cluster mode

Workers processes will send logs to the cluster master for writing to file.

Setup is fully transparent for developper.

A full example can be found [here](https://github.com/bpaquet/log4node/blob/master/test/cluster/test1.js).

## Reopen log file

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
