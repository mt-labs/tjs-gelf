'use strict';

// Include dependencies
var gulp = require('gulp');

// Export Gelf public API
module.exports = {
	
	/**
	 * Define a task.
	 */
	task: gulp.task.bind(gulp),
	
	
	/**
	 * Watch files and directories for changes.
	 */
	watch: gulp.watch.bind(gulp),
	
	
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
		
	}
	
};
