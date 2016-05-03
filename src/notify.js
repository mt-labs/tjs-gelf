'use strict';

/**
 * Get a notify module bound to the given Gelf instance.
 */
function bind(gelf) {

	// Dependencies
	const lib = {
		debounce: require('debounce'),
		extend: require('extend'),
		log: require('fancy-log'),
		notifier: require('node-notifier'),
		path: require('path'),
		through: require('through2'),
	};

	// Buffer of unsent task-done notifications
	let doneTasksBuffer = [];

	// Debounced task-done call
	let doneTasksFn = null;


	/**
	 * Get the path to a stock icon.
	 */
	function getIcon(icon) {

		let iconFile = icon + '.png';

		let iconPath = lib.path.resolve(
			lib.path.join(__dirname, '..', 'icons', iconFile)
		);

		return iconPath;

	}


	/**
	 * Send a notification.
	 */
	function notify(type, title, message) {

		let defaultConfig = gelf.config('notify');

		let config = lib.extend(true, defaultConfig, {
			title:    title,
			message:  message,
			icon:     getIcon(type),
		});

		lib.notifier.notify(config, function(error, response) {});

	}


	/**
	 * Execute a function in a streaming pipe.
	 */
	function pipeExec(fn) {

		let canExec = true;

		function transform(chunk, enc, cb) {
			if (canExec) {
				fn();
				canExec = false;
			}
			cb(null, chunk);
		}

		function flush(cb) {
			canExec = false;
			cb();
		}

		return lib.through.obj(null, transform, flush);

	}


	/**
	 * Send a streaming log notification.
	 */
	function log(title, message) {

		if (message == null) {
			message = title;
			title = 'Task says…';
		}

		return pipeExec(function() {
			notify('log', title, message);
		});

	}


	/**
	 * Send buffered task-done notifications.
	 */
	function doneTasks() {

		if (doneTasksBuffer.length === 0) {
			return;
		}

		let title = (doneTasksBuffer.length === 1) ?
			'Task finished' :
			doneTasksBuffer.length + ' tasks finished'

		notify('done', title, doneTasksBuffer.join(', '));

		doneTasksBuffer = [];
		doneTasksFn = null;

	}


	/**
	 * Send a streaming task-done notification.
	 */
	function done(task) {

		return pipeExec(function() {

			if (!doneTasksFn) {
				let delay = gelf.config('notify').groupDone;
				doneTasksFn = (delay !== false) ?
					lib.debounce(doneTasks, (delay !== true) ? +delay : 200) :
					doneTasks;
			}

			doneTasksBuffer.push(task);
			doneTasksFn();

		});

	}


	/**
	 * Notify on error.
	 */
	function error(error) {

		// Error is a PluginError object
		if (typeof error === 'object' && error.message) {

			let title = 'Error running ' + (error.plugin || 'task');

			let message = error.message;
			if (error.fileName) {
				let dirname = lib.path.dirname(message);
				if (message.substr(0, dirname.length) === dirname) {
					message = message.substr(dirname.length + 1);
				}
			}

			notify('error', title, message);

		}

		// Error is a string
		else {
			notify('error', 'Error running task', message);
		}

	}


	// Public API
	log.error = error;
	log.done = done;
	return log;

}


// Export public API
module.exports = {
	bind: bind,
};
