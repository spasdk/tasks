/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    tools  = require('node-runner/lib/tools'),
    name   = 'pug',
    log    = runner.log.wrap(name);


function build ( config, done ) {
    var pug = require('pug'),
        render, data;

    try {
        // prepare function and data
        render = pug.compileFile(config.source, config.options || {});
        data   = render(config.variables || {});

        // save generated result
        tools.write([{name: config.target, data: data}], log, done);
    } catch ( error ) {
        log.fail(error.toString());
    }
}


function generator ( config, options ) {
    // sanitize
    options = Object.assign(generator.options, options || {});

    runner.task(options.prefix + 'config' + options.suffix, function () {
        log.inspect(config, log);
    });

    runner.task(options.prefix + 'build' + options.suffix, function ( done ) {
        build(config, done);
    });

    runner.task(options.prefix + 'clear' + options.suffix, function ( done ) {
        tools.unlink([config.target], log, done);
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
