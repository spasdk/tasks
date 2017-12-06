/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    async  = require('cjs-async'),
    fs     = require('fs'),
    path   = require('path'),
    colors = runner.log.colors,
    name   = 'webpack',
    log    = runner.log.wrap(name),
    config = {
        watchOptions: {
            aggregateTimeout: 50
        }
    },
    compiler, buildInfo;


function report ( error, stats ) {
    var dir = path.relative('.', config.output.path);

    buildInfo = stats.toJson({source: false});
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
        log.info('time: %s ms', log.colors.magenta(buildInfo.time));
        log.info('hash: ' + log.colors.grey(buildInfo.hash));
        buildInfo.assets.forEach(function ( asset ) {
            log.info(
                'write %s (size: %s)',
                log.colors.bold(path.join(dir, asset.name)),
                log.colors.green(asset.size)
            );
        });

        buildInfo.errors.forEach(function ( error ) {
            error = error.split('\n');
            log.fail('%s %s', log.colors.bold(error.shift()), error.shift());
            console.log(log.colors.red(error.join('\n')));
        });

        buildInfo.warnings.forEach(function ( warning ) {
            warning = warning.split('\n');
            log.warn('%s %s', log.colors.bold(warning.shift()), warning.shift());
            console.log(log.colors.yellow(warning.join('\n')));
        });
    }
}


// add this task config section
runner.config[name] = config;


runner.task(name + ':clear', function ( done ) {
    var files = [path.relative('.', path.join(config.output.path, config.output.filename))];

    // add map file
    if ( config.output.sourceMapFilename ) {
        files.push(path.relative('.', path.join(config.output.path, config.output.sourceMapFilename)));
    }

    // convert file list to delete task list and execute
    async.parallel(files.map(function ( file ) {
        // create task
        return function ( ready ) {
            fs.unlink(file, function ( error ) {
                if ( !error ) {
                    log.info('remove ' + colors.bold(file));
                } else if ( error.code !== 'ENOENT' ) {
                    log.fail(error.toString());
                }
                ready();
            });
        };
    }), done);
});


runner.task(name + ':modules', function () {
    if ( buildInfo ) {
        buildInfo.modules.forEach(function ( module ) {
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
});


runner.task(name + ':build', function ( done ) {
    var webpack = require('webpack');

    // reuse existing instance if possible
    if ( !compiler ) {
        compiler = webpack(config);
    }

    compiler.run(function ( error, stats ) {
        report(error, stats);
        //console.log(stats.toString('verbose'));
        done();
    });
});


runner.task(name + ':watch', function ( done ) {
    var webpack = require('webpack');

    // reuse existing instance if possible
    if ( !compiler ) {
        compiler = webpack(config);
    }

    compiler.watch(config.watchOptions, report);
});


runner.alias(name, name + ':build');
