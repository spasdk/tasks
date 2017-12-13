/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs    = require('fs'),
    util  = require('util'),
    async = require('cjs-async');


// public
module.exports = {
    clear: function ( files, log, done ) {
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
    },

    write: function ( files, log, done ) {
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
    },

    config: function ( config, log ) {
        util.inspect(config, {colors: true, depth: 5}).split('\n').forEach(function ( line ) {
            log.info(line);
        });
    }
};
