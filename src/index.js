'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
	glob: require('glob'),
	gulp: require('gulp'),
	path: require('path'),
	watch: require('gulp-watch'),
	batch: require('./batch'),
	config: require('./config'),
	runner: require('./runner'),
	load: require('./load'),
};


// Private API
// ---------------------------------------------------------

/**
 * Return a function that re-directs the call to the Gulp instance.
 */
function gulpCall(name) {

	return function() {

		var fn = this.gulp[name];
		return fn.apply(this.gulp, Array.prototype.slice.call(arguments, 0));

	};

}


// Public API
// ---------------------------------------------------------

/**
 * Gelf constructor.
 */
function Gelf(gulp) {

	this.gulp = gulp;

	this._config = {};
	this._configFn = {};

	this.config('global', {
		src:  'src',
		dest: 'web',
	});

}


// Gelf prototype.
lib.extend(Gelf.prototype, {

	Gelf: Gelf,


	/**
	 * Define a task.
	 */
	task: function(name, deps, cb) {

		if (deps || cb) {
			lib.batch(this.gulp, name);
		}

		return this.gulp.task.apply(this.gulp, Array.prototype.slice.call(arguments, 0));

	},


	/**
	 * Watch files and directories for changes.
	 */
	watch: function(glob, tasks) {

		var options = {
			read:        false,
			usePolling:  true,
			interval:    100,
		};

		return lib.watch('src/**/*.*', options, lib.runner(this.gulp, tasks));

	},


	/**
	 * Emit files matching provided glob or an array of globs.
	 */
	src: gulpCall('src'),


	/**
	 * Write a file or files to a destination.
	 */
	dest: gulpCall('dest'),


	/**
	 * Start a task.
	 */
	start: gulpCall('start'),


	/**
	 * Configure a Gelf task.
	 */
	config: lib.config,


	/**
	 * Load Gelf tasks from a file, directory, or object.
	 */
	load: function(target) {

		var load = this.load.bind(this);

		// Load tasks from an array
		if (Array.isArray(target)) {
			return target.forEach(load);
		}

		// Load tasks from a string
		if (typeof target === 'string') {

			// String is a glob pattern
			if (lib.glob.hasMagic(target)) {
				return lib.glob.sync(target).forEach(load);
			}

			// String is a path
			target = require(
				lib.path.normalize(process.cwd() + '/' + target)
			);

		}

		// Load tasks from an object
		lib.load(this, target);

	}

});

// Export an instance of Gelf
module.exports = new Gelf(lib.gulp);
