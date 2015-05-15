'use strict';

// Include dependencies
var gulp = require('gulp');
var watch = require('gulp-watch');

var batch = require('./batch');
var runner = require('./runner');


// Private API
// ---------------------------------------------------------


// Public API
// ---------------------------------------------------------

module.exports = {

	/**
	 * Define a task.
	 */
	task: function(name, deps, cb) {

		if (deps || cb) {
			batch(name);
		}

		return gulp.task.apply(gulp, Array.prototype.slice.call(arguments, 0));

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

		return watch('src/**/*.*', options, runner(tasks));

	},


	/**
	 * Emit files matching provided glob or an array of globs.
	 */
	src: gulp.src.bind(gulp),


	/**
	 * Write a file or files to a destination.
	 */
	dest: gulp.dest.bind(gulp),


	/**
	 * Start a task.
	 */
	start: gulp.start.bind(gulp),


	/**
	 * Configure a Gelf task.
	 */
	config: function(name, config) {

	},


	/**
	 * Load Gelf tasks from a file, directory, or object.
	 */
	load: function(target) {

	},


	getTaskRunner: runner

};
