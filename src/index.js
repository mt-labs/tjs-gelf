'use strict';

// Include dependencies
var gulp = require('gulp');
var extend = require('extend');
var watch = require('gulp-watch');

var batch = require('./batch');
var runner = require('./runner');


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

}

// Gelf prototype.
extend(Gelf.prototype, {

	Gelf: Gelf,


	/**
	 * Define a task.
	 */
	task: function(name, deps, cb) {

		if (deps || cb) {
			batch(gulp, name);
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

		return watch('src/**/*.*', options, runner(gulp, tasks));

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
	config: function(name, config) {

	},


	/**
	 * Load Gelf tasks from a file, directory, or object.
	 */
	load: function(target) {

	}

});

// Export an instance of Gelf
module.exports = new Gelf(gulp);
