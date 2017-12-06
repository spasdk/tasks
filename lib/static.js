/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var util   = require('util'),
    path   = require('path'),
    open   = require('open'),
    runner = require('node-runner'),
    name   = 'static',
    log    = runner.log.wrap(name),
    config = {
        path: '.',
        open: '',
        port: 8080,
        cache: false
    },
    server;


// add this task config section
runner.config[name] = config;


runner.task(name + ':start', function ( done ) {
    // rfc 2616 compliant HTTP static file server
    var files = new (require('node-static').Server)(config.path, {cache: config.cache});

    server = require('http').createServer(function ( request, response ) {
        request.addListener('end', function () {
            // static files
            files.serve(request, response, function ( error ) {
                var address = request.connection.remoteAddress || log.colors.red('[0.0.0.0]'),
                    status  = response.statusCode === 200 ? log.colors.green(response.statusCode) : log.colors.yellow(response.statusCode);

                if ( error ) {
                    response.end();
                }

                log[error ? 'fail' : 'info'](
                    '%s\t%s\t%s\t%s',
                    address.replace('::ffff:', ''),
                    request.method,
                    error ? log.colors.red(error.status) : status,
                    request.url.replace(/\//g, log.colors.grey('/'))
                );
            });
        }).resume();
    });

    server.on('listening', function () {
        var url;

        // port can be 0 from the start
        config.port = server.address().port;

        url = 'http://' + require('ip').address() + ':' + config.port + '/' + config.open;

        log.info('serving directory: ' + log.colors.bold(path.resolve(config.path)));
        log.info('web address: ' + log.colors.green.bold(url));

        // open page in browser
        runner.task(name + ':open', function () {
            open(url);
        });
    });

    server.on('close', done);

    server.on('error', function ( error ) {
        log.fail(error.toString());

        done();
    });

    server.listen(config.port);
});


runner.task(name + ':stop', function () {
    if ( server ) {
        server.close();
        server = null;
    }
});


runner.alias(name, name + ':start');
