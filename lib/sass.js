/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    async  = require('cjs-async'),
    fs     = require('fs'),
    name   = 'sass',
    log    = runner.log.wrap(name),
    config = {
        file: '',
        outFile: '',
        indentWidth: 4,
        precision: 2
    };


// add this task config section
runner.config[name] = config;


runner.task(name + ':clear', function ( done ) {
    var files = [config.outFile];

    // add map file
    config.sourceMap && files.push(config.sourceMap);

    // convert file list to delete task list and execute
    async.parallel(files.map(function ( file ) {
        // create task
        return function ( ready ) {
            fs.unlink(file, function ( error ) {
                if ( !error ) {
                    log.info('remove ' + log.colors.bold(file));
                } else if ( error.code !== 'ENOENT' ) {
                    log.fail(error.toString());
                }
                ready();
            });
        };
    }), done);
});


runner.task(name + ':build', function ( done ) {
    var sass = require('node-sass');

    // do the magic
    sass.render(config, function ( error, result ) {
        var files;

        if ( error ) {
            log.fail(error.toString());
            done(error);
        } else {
            // add css file
            files = [{name: config.outFile, data: result.css}];

            // add map file
            if ( config.sourceMap && typeof config.sourceMap === 'string' && result.map ) {
                files.push({name: config.sourceMap, data: result.map});
            }

            // convert file list to write task list and execute
            async.parallel(files.map(function ( file ) {
                // create task
                return function ( ready ) {
                    fs.writeFile(file.name, file.data, function ( error ) {
                        if ( error ) {
                            log.fail(error.toString());
                        } else {
                            log.info(
                                'write %s (size: %s)',
                                log.colors.bold(file.name),
                                log.colors.green(fs.statSync(file.name).size)
                            );
                        }

                        ready();
                    });
                };
            }), done);
        }
    });
});

runner.alias(name, name + ':build');
