/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// public
module.exports = {
    eslint:     require('./lib/eslint'),
    livereload: require('./lib/livereload'),
    pug:        require('./lib/pug'),
    sass:       require('./lib/sass'),
    repl:       require('./lib/repl'),
    static:     require('./lib/static'),
    webpack:    require('./lib/webpack')
};
