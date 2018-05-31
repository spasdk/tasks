/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    tools  = require('node-runner/lib/tools'),
    name   = 'webpack',
    log    = runner.log.wrap(name);


function report ( config, instance, error, stats ) {
    var path = require('path'),
        dir  = path.relative('.', config.output.path);

    //
    // runner.log.warn(name, '');
    // report.warnings.forEach(function ( warning ) {
    //     warning = 'Warning in ' + warning;
    //     warning.split('\n').forEach(function ( line ) {
    //         runner.log.warn(name, line);
    //     });
    // });
    // runner.log.warn(name, '');
    //
    // runner.log.warn(name, '');
    // report.errors.forEach(function ( error ) {
    //     error = 'Error in ' + error;
    //     error.split('\n').forEach(function ( line ) {
    //         runner.log.fail(name, line);
    //     });
    // });

    //console.log(stats.toString('normal'));

    //console.log(report.errors);

    // stats.toString().split('\n').forEach(function ( line ) {
    //     log.info(line);
    // });

    if ( error ) {
        log.fail(error.toString());
    } else {
        instance.stats = stats.toJson({source: false});

        log.info('time: %s ms', log.colors.magenta(instance.stats.time));
        log.info('hash: ' + log.colors.grey(instance.stats.hash));

        instance.stats.assets.forEach(function ( asset ) {
            log.info(
                'write %s (size: %s)',
                log.colors.bold(path.join(dir, asset.name)),
                log.colors.green(asset.size)
            );
        });

        instance.stats.errors.forEach(function ( error ) {
            error = error.split('\n');
            log.fail('%s %s', log.colors.bold(error.shift()), error.shift());
            console.log(log.colors.red(error.join('\n')));
        });

        instance.stats.warnings.forEach(function ( warning ) {
            warning = warning.split('\n');
            log.warn('%s %s', log.colors.bold(warning.shift()), warning.shift());
            console.log(log.colors.yellow(warning.join('\n')));
        });
    }
}


// eslint-disable-next-line no-unused-vars
function watch ( config, instance, done ) {
    var webpack = require('webpack');

    // reuse existing instance if possible
    instance.compiler = instance.compiler || webpack(config);

    if ( instance.compiler.running ) {
        // if build function is still running
        log.fail('You ran Webpack twice. Each instance only supports a single concurrent compilation at a time.');
        done();
    } else {
        instance.watcher = instance.compiler.watch(config.watchOptions, function ( error, stats ) {
            report(config, instance, error, stats);
            if ( instance.buildInWatch ) {
                // if the watch function is called by the build function
                instance.buildInWatch = false;
                done();
            }
        });

        if ( !instance.buildInWatch ) {
            instance.watcherDone = done;
        }
    }

    return instance;
}


function build ( config, instance, done ) {
    var webpack = require('webpack');

    // reuse existing instance if possible
    instance.compiler = instance.compiler || webpack(config);

    if ( instance.watcher ) {
        // if watch function is still running
        instance.buildInWatch = true;
        instance.watcher.close(function () {
            watch(config, instance, done);
        });
    } else {
        instance.compiler.run(function ( error, stats ) {
            report(config, instance, error, stats);
            done();
        });
    }

    return instance;
}


function unwatch ( instance ) {
    if ( instance.watcher ) {
        instance.watcher.close(function () {
            instance.watcher = null;
            instance.buildInWatch = false;
            instance.watcherDone();
        });
    }

    return instance;
}


function clear ( config, done ) {
    var path  = require('path'),
        files = [path.relative('.', path.join(config.output.path, config.output.filename))];

    // add map file
    if ( config.output.sourceMapFilename ) {
        files.push(path.relative('.', path.join(config.output.path, config.output.sourceMapFilename)));
    }

    tools.unlink(files, log, done);
}


function modules ( instance ) {
    if ( instance ) {
        instance.stats.modules.forEach(function ( module ) {
            log.info(log.colors.bold(module.name));
            if ( module.reasons.length ) {
                module.reasons.forEach(function ( reason ) {
                    log.info('    %s %s from %s',
                        log.colors.grey(reason.type),
                        log.colors.green(reason.userRequest),
                        log.colors.green(reason.module)
                    );
                });
            } else {
                log.info(log.colors.grey('    (root)'));
            }
        });
    }
}


function generator ( config, options ) {
    var instance = {};

    // sanitize
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        log.inspect(config);
    });

    runner.task(options.prefix + 'build' + options.suffix, function ( done ) {
        instance = build(config, instance, done);
    });

    runner.task(options.prefix + 'modules' + options.suffix, function () {
        modules(instance);
    });

    runner.task(options.prefix + 'clear' + options.suffix, function ( done ) {
        clear(config, done);
    });

    runner.task(options.prefix + 'watch' + options.suffix, function ( done ) {
        instance = watch(config, instance, done);
    });

    runner.task(options.prefix + 'unwatch' + options.suffix, function () {
        instance = unwatch(instance);
    });
}


// defaults
generator.options = {
    prefix: name + ':',
    suffix: ''
};


// export main actions
generator.methods = {
    build: build
};


// public
module.exports = generator;
