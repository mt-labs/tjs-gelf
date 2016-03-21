'use strict';

// Constants
const DELIMITER = ':';


/**
 * Get a task module bound to the given Gelf instance.
 */
function bind(gelf) {

	var gulp = gelf.gulp;

	// Object for storing the dependencies of each batch task
	var allDeps = {};


	/**
	 * Add a batch task.
	 */
	function addBatchTask(taskName) {

		// Remove the right-most component to get the batch name
		var batchName = taskName.split(DELIMITER).slice(0, -1).join(DELIMITER);
		if (!batchName) {
			return;
		}

		// Get known dependencies for this batch
		var batchDeps = allDeps[batchName];
		if (batchDeps == null) {
			batchDeps = allDeps[batchName] = [];
		}

		// Append the current task to the batch
		batchDeps.push(taskName);

		// Register the batch task with dependencies
		if (gulp.tasks[batchName] == null) {
			gelf.task(batchName, batchDeps);
		}

	}


	/**
	 * Add a task.
	 */
	function task(name, deps, cb) {

		if (deps || cb) {
			addBatchTask(name);
		}

		return gulp.task.apply(gulp, Array.prototype.slice.call(arguments, 0));

	}


	// Public API
	return task;

}


// Export public API
module.exports = {
	bind: bind,
};
