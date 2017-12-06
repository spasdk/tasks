/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'repl',
    log    = runner.log.wrap(name),
    config = {
        prompt: '',
        removeHistoryDuplicates: true
    },
    readline;


// add this task config section
runner.config[name] = config;


runner.task(name + ':start', function ( done ) {
    readline = require('readline').createInterface(Object.assign({
        input: process.stdin,
        output: process.stdout,
        completer: function ( line ) {
            var tasks = Object.keys(runner.tasks).sort(),
                hits  = tasks.filter(function ( task ) {
                    return task.startsWith(line);
                });

            // show all completions if none found
            return [hits.length ? hits : tasks, line];
        }
    }, config));

    readline.on('line', function ( line ) {
        if ( line ) {
            if ( runner.tasks[line] ) {
                runner.run(line);
            } else {
                log.warn('task %s is missing', log.colors.bold(line));
            }
        }
    });

    readline.on('close', function () {
        done();
    });

    // readline.on('SIGINT', function onSIGINT () {
    //     readline.close();
    // });
});


runner.task(name + ':stop', function () {
    if ( readline ) {
        readline.close();
        readline = null;
    }
});


runner.alias(name, name + ':start');
