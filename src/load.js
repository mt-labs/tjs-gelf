'use strict';

// Include dependencies
var lib = {
	glob: require('glob'),
	path: require('path'),
};


// Constants
// ---------------------------------------------------------

var DELIMITER = ':';


// Private API
// ---------------------------------------------------------

/**
 * Transform a task name.
 */
function transformTaskName(name) {

	var makeDashed = function(match) {
		return '-' + match.toLowerCase();
	};

	return name
		.replace('_', DELIMITER)
		.replace(/[A-Z]/g, makeDashed)
	;

}


/**
 * Try to infer a module name from a hash of tasks.
 */
function inferModuleName(tasks) {

	var modName = null;
	var error = false;

	for (var taskName in tasks) {

		var subName = taskName.split(DELIMITER).pop();

		if (modName != null && subName !== modName) {
			error = true;
			break;
		}

		modName = subName;

	}

	if (modName == null || error) {
		throw new Error('Could not infer task name from loaded module');
	}

	return modName;

}


/**
 * Get a function to configure and run a task.
 */
function getTaskRunner(gelf, task, name) {

	if (task.length >= 3) {
		return function(done) {
			return task(gelf, gelf.config(name), done);
		};
	}

	return function() {
		return task(gelf, gelf.config(name));
	};

}


/**
 * Get a hash of tasks from a task module.
 */
function getModuleTasks(mod) {

	var out = {};

	var tasks = mod.getTasks();
	for (var taskName in tasks) {
		out[transformTaskName(taskName)] = tasks[taskName];
	}

	return out;

}


/**
 * Load a task module.
 */
function loadTaskModule(gelf, mod) {

	var tasks = getModuleTasks(mod);

	var modName = mod.name || inferModuleName(tasks);

	if (typeof mod.getConfig === 'function') {
		gelf.config(modName, mod.getConfig);
	}

	for (var taskName in tasks) {
		gelf.task(taskName, getTaskRunner(gelf, tasks[taskName], modName));
	}

}


// Public API
// ---------------------------------------------------------

/**
 * Load Gelf tasks from a file, directory, or object.
 */
module.exports = function load(target) {

	var gelf = this;

	// Load tasks from an array
	if (Array.isArray(target)) {
		return target.forEach(load.bind(gelf));
	}

	// Load tasks from a string
	if (typeof target === 'string') {

		// String is a glob pattern
		if (lib.glob.hasMagic(target)) {
			return lib.glob.sync(target).forEach(load.bind(gelf));
		}

		// String is a path
		target = require(
			lib.path.normalize(process.cwd() + '/' + target)
		);

	}

	// Load tasks from an object
	loadTaskModule(gelf, target);

};
