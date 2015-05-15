'use strict';

// Constants
// ---------------------------------------------------------

var DELIMITER = ':';


// Private API
// ---------------------------------------------------------

/**
 * Add a batch task.
 */
function addBatchTask(gulp, name) {

	var batchName = name.split(DELIMITER).slice(0, -1).join(DELIMITER);
	if (!batchName) {
		return;
	}

	var batchTask = gulp.tasks[batchName];
	if (batchTask && !batchTask.isBatch) {
		return;
	}

	var batchDeps = [name];
	if (batchTask) {
		batchDeps = batchTask.dep.concat(batchDeps);
	}

	gulp.task(batchName, batchDeps);
	gulp.tasks[batchName].isBatch = true;

}


// Public API
// ---------------------------------------------------------

module.exports = addBatchTask;
