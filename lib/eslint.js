/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var runner = require('node-runner'),
    name   = 'eslint',
    log    = runner.log.wrap(name),
    engine;


runner.task(name, function () {
    var CLIEngine = require('eslint').CLIEngine;

    if ( !engine ) {
        engine = new CLIEngine({
            cache: true
            // envs: ["browser", "mocha"],
            // useEslintrc: false,
            // rules: {
            //     semi: 2
            // }
        });
    }

    var report = engine.executeOnFiles(['src/js']);

    report.results.forEach(function ( result ) {
        console.log(result);
    });
});
