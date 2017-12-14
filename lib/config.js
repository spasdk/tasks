/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'config',
    log    = runner.log.wrap(name);


runner.task(name, function () {
    var info = require('util').inspect(runner.config, {colors: true, depth: 5});

    info.split('\n').forEach(function ( line ) {
        log.info(line);
    });
});

runner.keystroke(name, 'alt+c');
