'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
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
			debounce:    200,
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

	// Bind task method
	this.task = require('./task').bind(this);

	// Bind watch method
	this.watch = require('./watch').bind(this);

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
	 * Watch files and directories for changes.
	 */
	// watch: function(glob, tasks) {

	// 	return lib.watch(glob, this.config('global').watch, lib.runner(this.gulp, tasks));

	// },


	/**
	 * Load Gelf tasks from a file, directory, or object.
	 */
	load: require('./load'),

});


// Export an instance of Gelf
module.exports = new Gelf(require('gulp'));
