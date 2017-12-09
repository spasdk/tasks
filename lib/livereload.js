/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner   = require('node-runner'),
    chokidar = require('chokidar'),
    name     = 'livereload',
    log      = runner.log.wrap(name),
    config   = {
        port: 35729
    },
    server, watcher, doneCallback;


// add this task config section
runner.config[name] = config;


runner.task(name + ':watch', function ( done ) {
    function handler ( name ) {
        // reload
        server.changed({
            body: {files: [name]}
        });

        log.info('changed: %s', log.colors.magenta(name));
    }

    server = require('tiny-lr')();
    doneCallback = done;

    server.listen(config.port, function () {
        // port can be 0 from the start
        config.port = server.port;

        watcher = chokidar.watch(config.watch, runner.watch.config);
        watcher
            .on('change', handler)
            .on('unlink', handler)
            .on('add',    handler);

        // report
        log.info('start server on port ' + config.port);
    });
});

runner.task(name + ':unwatch', function () {
    if ( server ) {
        server.close();
        watcher.close();
        doneCallback();
    }
});
