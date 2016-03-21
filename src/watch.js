'use strict';

/**
 * Get a watch module bound to the given Gelf instance.
 */
function bind(gelf) {

	/**
	 * Watch files and directories for changes.
	 */
	function watch(glob, opts, fn) {

		if (typeof opts === 'function' || Array.isArray(opts)) {
			fn = opts;
			opts = null;
		}

		var config = gelf.config('watch');
		if (typeof opts === 'object') {
			require('extend')(true, config, opts);
		}

		if (Array.isArray(fn)) {
			fn = function(gelf, tasks) {
				gelf.start.apply(gelf, tasks);
			}.bind(null, gelf, fn);
		}

		// Debounce
		if (config.debounce) {
			let delay = (config.debounce === true) ? 200 : config.debounce | 0;
			fn = require('debounce')(fn, delay);
		}

		// Start watching
		return require('gulp-watch')(glob, config, fn);

	}


	// Public API
	return watch;

}


// Export public API
module.exports = {
	bind: bind,
};
