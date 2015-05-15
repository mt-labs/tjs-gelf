'use strict';

// Include dependencies
var gulp = require('gulp');


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
function getFunctionTaskRunner(fn) {

	return getDebounced(fn);

}


/**
 * Get a runner for a named Gulp task.
 */
function getNamedTaskRunner(task) {

	var isRunning = false;
	var runAgain = false;

	var run = function run() {

		isRunning = true;

		gulp.start(task, function() {

			isRunning = false;

			if (runAgain) {
				runAgain = false;
				run();
			}

		});

	};

	var runDebounced = getDebounced(run);

	return function(debounce) {

		if (isRunning) {
			runAgain = true;
			return;
		}

		runDebounced(debounce);

	};

}


/**
 * Get a runner for an array of tasks.
 */
function getArrayTaskRunner(tasks) {

	tasks = tasks.map(getTaskRunner);

	return function(debounce) {
		for (var i = 0, ix = tasks.length; i < ix; i++) {
			tasks[i](debounce);
		}
	};

}


/**
 * Get a runner for an arbitary task.
 */
function getTaskRunner(task) {

	if (Array.isArray(task)) {
		return getArrayTaskRunner(task);
	}

	if (typeof task === 'function') {
		return getFunctionTaskRunner(task);
	}

	if (typeof task === 'string') {
		return getNamedTaskRunner(task);
	}

	throw new Error(
		'Invalid task specified'
	);

}


// Public API
// ---------------------------------------------------------

module.exports = getTaskRunner;
