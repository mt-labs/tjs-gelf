'use strict';

// Private API
// ---------------------------------------------------------

/**
 * Get a debounced function.
 */
function getDebounced(fn, delay) {

	var timeout = null;

	delay = (delay != null) ? (delay | 0) : 500;

	return function() {

		// Clear an existing timeout
		if (timeout != null) {
			clearTimeout(timeout);
			timeout = null;
		}

		// If a delay is set, start a new timeout
		if (delay > -1) {
			timeout = setTimeout(function() {
				timeout = null;
				fn();
			}, delay);
		}

		// Otherwise, call the function immediately
		else {
			fn();
		}

	};

}


/**
 * Get a runner for a function task.
 */
function getFunctionTaskRunner(gulp, fn) {

	return getDebounced(fn);

}


/**
 * Get a runner for a named Gulp task.
 */
function getNamedTaskRunner(gulp, task) {

	return getDebounced(function() {

		gulp.start(task);

	});

}


/**
 * Get a runner for an array of tasks.
 */
function getArrayTaskRunner(gulp, tasks) {

	tasks = tasks.map(getTaskRunner.bind(null, gulp));

	return function() {
		for (var i = 0, ix = tasks.length; i < ix; i++) {
			tasks[i]();
		}
	};

}


/**
 * Get a runner for an arbitary task.
 */
function getTaskRunner(gulp, task) {

	if (Array.isArray(task)) {
		return getArrayTaskRunner(gulp, task);
	}

	if (typeof task === 'function') {
		return getFunctionTaskRunner(gulp, task);
	}

	if (typeof task === 'string') {
		return getNamedTaskRunner(gulp, task);
	}

	throw new Error(
		'Invalid task specified'
	);

}


// Public API
// ---------------------------------------------------------

module.exports = getTaskRunner;
