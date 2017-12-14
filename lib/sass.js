/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    tools  = require('./tools'),
    name   = 'sass',
    log    = runner.log.wrap(name);


function build ( config, done ) {
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

            // save generated result
            tools.write(files, log, done);
        }
    });
}

function clear ( config, done ) {
    var files = [config.outFile];

    // add map file
    config.sourceMap && files.push(config.sourceMap);

    tools.clear(files, log, done);
}


function generator ( config, options ) {
    // sanitize
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        tools.config(config, log);
    });

    runner.task(options.prefix + 'build' + options.suffix, function ( done ) {
        build(config, done);
    });

    runner.task(options.prefix + 'clear' + options.suffix, function ( done ) {
        clear(config, done);
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
