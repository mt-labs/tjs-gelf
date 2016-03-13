'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
	gulp: require('gulp'),
	watch: require('gulp-watch'),
	batch: require('./batch'),
	runner: require('./runner'),
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

	this.config('env', 'dev');

	this.config('poll', false);

	this.config('watch', function(config, get) {
		var poll = get('poll');
		return {
			read:        false,
			usePolling:  !!poll,
			interval:    (typeof poll === 'number') ? poll : 200,
		};
	});

}


// Gelf prototype
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

		return lib.watch(glob, this.config('global').watch, lib.runner(this.gulp, tasks));

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
	config: require('./config'),


	/**
	 * Load Gelf tasks from a file, directory, or object.
	 */
	load: require('./load'),

});


// Export an instance of Gelf
module.exports = new Gelf(lib.gulp);
