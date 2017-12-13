/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

require('spa-task-config');
require('./lib/livereload');
require('./lib/notify');
require('./lib/repl');
require('./lib/static');
require('./lib/status');
require('./lib/webpack');


// public
module.exports = {
    eslint: require('./lib/eslint'),
    pug:    require('./lib/pug'),
    sass:   require('./lib/sass'),
    repl:   require('./lib/repl')
};
