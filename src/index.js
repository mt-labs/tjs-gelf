'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
	watch: require('gulp-watch'),
	batch: require('./batch'),
	runner: require('./runner'),
};


/**
 * Add default config to a Gelf instance.
 */
function configureDefaults(gelf) {

	gelf.config('env', 'dev');

	gelf.config('poll', false);

	gelf.config('watch', function(config, get) {
		var poll = get('poll');
		return {
			read:        false,
			usePolling:  !!poll,
			interval:    (typeof poll === 'number') ? poll : 200,
		};
	});

}


/**
 * Gelf constructor.
 */
function Gelf(gulp) {

	// Expose the Gelf constructor
	this.Gelf = Gelf;

	// Expose the Gulp instance
	this.gulp = gulp;

	// Bind config method
	this.config = require('./config').bind(this);

	// Bind Gulp methods
	this.dest = gulp.dest.bind(gulp);
	this.on = gulp.on.bind(gulp);
	this.src = gulp.src.bind(gulp);
	this.start = gulp.start.bind(gulp);

	// Add default config
	configureDefaults(this);

}


// Gelf prototype
lib.extend(Gelf.prototype, {

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
	 * Load Gelf tasks from a file, directory, or object.
	 */
	load: require('./load'),

});


// Export an instance of Gelf
module.exports = new Gelf(require('gulp'));
