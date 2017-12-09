/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path     = require('path'),
    runner   = require('node-runner'),
    chokidar = require('chokidar'),
    name     = 'eslint',
    log      = runner.log.wrap(name),
    config   = {},
    status   = {},
    engine, watcher, doneCallback;


// add this task config section
runner.config[name] = config;


runner.task(name + ':watch', function ( done ) {
    var CLIEngine = require('eslint').CLIEngine;

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

    engine = new CLIEngine(config.options);
    doneCallback = done;

    watcher = chokidar.watch(config.watch, runner.watch.config);
    watcher
        .on('change', handler)
        .on('unlink', handler)
        .on('add',    handler);
});


runner.task(name + ':unwatch', function () {
    if ( watcher ) {
        watcher.close();
        doneCallback();
    }
});
