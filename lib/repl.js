/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'repl',
    log    = runner.log.wrap(name);


function start ( config, done ) {
    var readline = require('readline').createInterface(config);

    readline.on('line', function ( line ) {
        if ( line ) {
            runner.run(line);
        }
    });

    readline.on('close', function () {
        done();
    });

    // readline.on('SIGINT', function onSIGINT () {
    //     readline.close();
    // });

    return readline;
}


function stop ( readline ) {
    if ( readline ) {
        readline.close();
    }
}


function generator ( config, options ) {
    var readline;

    // sanitize
    config = Object.assign({
        input: process.stdin,
        output: process.stdout,
        prompt: '',
        historySize: 100,
        removeHistoryDuplicates: true,
        completer: function ( line ) {
            var tasks = Object.keys(runner.tasks).sort(),
                hits  = tasks.filter(function ( task ) {
                    return task.startsWith(line);
                });

            // show all completions if none found
            return [hits.length ? hits : tasks, line];
        }
    }, config || {});
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        log.inspect(config, log);
    });

    runner.task(options.prefix + 'start' + options.suffix, function ( done ) {
        readline = start(config, done);
    });

    runner.task(options.prefix + 'stop' + options.suffix, function () {
        stop(readline);
        readline = null;
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
