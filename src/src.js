'use strict';

/**
 * Get a src module bound to the given Gelf instance.
 */
function bind(gelf) {

	// Gulp instance
	var gulp = gelf.gulp;

	// Dependencies
	var lib = {
		plumber: require('gulp-plumber'),
	};


	/**
	 * Plumber error handler.
	 */
	function onError(error) {

		console.error('' + error);
		gelf.notify.error(error);

		this.emit('end');

	}


	/**
	 * Watch files and directories for changes.
	 */
	function src(globs, options) {

		return gulp.src.apply(gulp, Array.prototype.slice.call(arguments, 0))
			.pipe(lib.plumber({
				errorHandler: onError
			}))
		;

	}


	// Public API
	return src;

}


// Export public API
module.exports = {
	bind: bind,
};
