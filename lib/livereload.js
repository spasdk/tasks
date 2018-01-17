/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'livereload',
    log    = runner.log.wrap(name);


function start ( config, done ) {
    var chokidar = require('chokidar'),
        server   = require('tiny-lr')(),
        watcher;

    function handler ( name ) {
        // reload
        server.changed({
            body: {files: [name]}
        });

        log.info('changed: %s', log.colors.magenta(name));
    }

    server.listen(config.port, function () {
        // port can be 0 from the start
        config.port = server.port;

        // report
        log.info('start server on port ' + config.port);
    });

    watcher = chokidar.watch(config.watch, runner.watch.config);
    watcher
        .on('change', handler)
        .on('unlink', handler)
        .on('add',    handler);

    return {
        server: server,
        watcher: watcher,
        done: done
    };
}


function stop ( instance ) {
    if ( instance ) {
        instance.server.close();
        instance.watcher.close();
        instance.done();
    }
}


function generator ( config, options ) {
    var instance;

    // sanitize
    config = Object.assign({
        port: 35729
    }, config || {});
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        log.inspect(config, log);
    });

    runner.task(options.prefix + 'start' + options.suffix, function ( done ) {
        instance = start(config, done);
    });

    runner.task(options.prefix + 'stop' + options.suffix, function () {
        stop(instance);
        instance = null;
    });
}


// defaults
generator.options = {
    prefix: name + ':',
    suffix: ''
};


// export main actions
generator.methods = {
    start: start,
    stop: stop
};


// public
module.exports = generator;
