/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'eslint',
    log    = runner.log.wrap(name);


function watch ( config, done ) {
    var path      = require('path'),
        chokidar  = require('chokidar'),
        CLIEngine = require('eslint').CLIEngine,
        failCount = {},
        engine, watcher;

    function handler ( name ) {
        var report = engine.executeOnFiles([name]);

        report.results.forEach(function ( result ) {
            result.messages.forEach(function ( message ) {
                log.fail(
                    '%s %s [%s:%s] %s',
                    log.colors.bold(path.relative('.', result.filePath)),
                    message.message,
                    message.line,
                    message.column,
                    log.colors.grey(message.ruleId)
                );
            });

            // no more errors?
            if ( result.messages.length === 0 && failCount[result.filePath] > 0 ) {
                log.info('%s fixed', log.colors.bold(path.relative('.', result.filePath)));
            }

            // remember each check errors amount
            failCount[result.filePath] = result.messages.length;
        });
    }

    engine = new CLIEngine(config.options);

    watcher = chokidar.watch(config.watch, runner.watch.config);
    watcher
        .on('change', handler)
        .on('unlink', handler)
        .on('add',    handler);

    return {
        engine: engine,
        watcher: watcher,
        done: done
    };
}

function unwatch ( instance ) {
    if ( instance ) {
        instance.watcher.close();
        instance.done();
    }
}


function generator ( config, options ) {
    var tools = require('./tools'),
        instance;

    // sanitize
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        tools.config(config, log);
    });

    runner.task(options.prefix + 'watch' + options.suffix, function ( done ) {
        instance = watch(config, done);
    });

    runner.task(options.prefix + 'unwatch' + options.suffix, function () {
        unwatch(instance);
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
    watch: watch,
    unwatch: unwatch
};


// public
module.exports = generator;
