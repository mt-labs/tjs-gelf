'use strict';

/**
 * Get a notify module bound to the given Gelf instance.
 */
function bind(gelf) {

	// Dependencies
	const lib = {
		extend: require('extend'),
		log: require('fancy-log'),
		notifier: require('node-notifier'),
		path: require('path'),
		through: require('through2'),
	};


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
	 * Send a streaming notification.
	 */
	function pipeNotify(type, title, message) {

		let canNotify = true;

		function transform(chunk, enc, cb) {
			if (canNotify) {
				notify(type, title, message);
				canNotify = false;
			}
			cb(null, chunk);
		}

		function flush(cb) {
			canNotify = false;
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

		return pipeNotify('log', title, message);

	}


	/**
	 * Send a streaming task-done notification.
	 */
	function done(task) {

		return pipeNotify('done', 'Task finished', task);

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
