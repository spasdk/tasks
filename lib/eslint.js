/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'eslint',
    log    = runner.log.wrap(name),
    status = {},
    engine, watcher, doneCallback;


function watch ( config, done ) {
    var path      = require('path'),
        chokidar  = require('chokidar'),
        CLIEngine = require('eslint').CLIEngine;

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
            if ( result.messages.length === 0 && status[result.filePath] > 0 ) {
                log.info('%s fixed', log.colors.bold(path.relative('.', result.filePath)));
            }

            // remember each check errors amount
            status[result.filePath] = result.messages.length;
        });
    }

    if ( !engine ) {
        engine = new CLIEngine(config.options);
    }

    doneCallback = done;

    watcher = chokidar.watch(config.watch, runner.watch.config);
    watcher
        .on('change', handler)
        .on('unlink', handler)
        .on('add',    handler);
}

function unwatch () {
    if ( watcher ) {
        watcher.close();
        watcher = null;
        doneCallback();
    }
}


function generator ( config, options ) {
    var tools = require('./tools');

    // sanitize
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        tools.config(config, log);
    });

    runner.task(options.prefix + 'watch' + options.suffix, function ( done ) {
        watch(config, done);
    });

    runner.task(options.prefix + 'unwatch' + options.suffix, function () {
        unwatch();
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
