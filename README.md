t-owned
=======

A webapp for helping TOs assign matches to setups.

How to run
==========
1. Make sure you have [node.js](http://nodejs.org/) and [Redis](http://redis.io) installed. Windows users will probably want to download it from [MSOpenTech](https://github.com/MSOpenTech/redis/releases) and follow [these steps](http://stackoverflow.com/questions/6476945/how-do-i-run-redis-on-windows/24046565#24046565). Alternatively, just download the latest executable from https://github.com/rgl/redis/downloads. You will have to start the service manually the first time, but it will start up on boot afterward.

2. Clone the repo change directory to the repo's root.

3. Run `npm install`.

4. Mac/Linux, run `DEBUG=t-owned bin/www` to start the project. In Powershell, set an environment variable with `$env:DEBUG = "t-owned"` before running `node bin/www`.
