/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs     = require('fs'),
    runner = require('node-runner'),
    name   = 'pug',
    log    = runner.log.wrap(name),
    config = {
        source: '',
        target: '',
        options: {},
        variables: {}
    };


// add this task config section
runner.config[name] = config;


runner.task(name + ':clear', function ( done ) {
    fs.unlink(config.target, function ( error ) {
        if ( !error ) {
            log.info('remove ' + log.colors.bold(config.target));
        } else if ( error.code !== 'ENOENT' ) {
            log.fail(error.toString());
        }
        done();
    });
});


runner.task(name + ':build', function () {
    var pug = require('pug'),
        render;

    try {
        // prepare function
        render = pug.compileFile(config.source, config.options);

        // save generated result
        fs.writeFileSync(config.target, render(config.variables));

        log.info(
            'write %s (size: %s)',
            log.colors.bold(config.target),
            log.colors.green(fs.statSync(config.target).size)
        );
    } catch ( error ) {
        log.fail(error.toString());
    }
});

runner.alias(name, name + ':build');
