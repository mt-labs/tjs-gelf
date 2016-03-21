'use strict';

/**
 * Get a load module bound to the given Gelf instance.
 */
function bind(gelf) {

	// Dependencies
	var lib = {
		glob: require('glob'),
		path: require('path'),
	};


	/**
	 * Load a task module.
	 */
	function loadModule(module, name, config) {

		if (typeof module !== 'function') {
			var t = typeof module;
			throw new Error('Expected task module to be a function, ' + t + ' given');
		}

		name = module(gelf, name);

		if (name == null) {
			throw new Error('Loaded module did not return a name');
		}

		if (config != null) {
			gelf.config(name, config);
		}

	}


	/**
	 * Load a task module from a path.
	 */
	function loadModuleFromPath(path, name, config) {

		var module = require(
			lib.path.normalize(process.cwd() + '/' + path)
		);

		loadModule(module, name, config);

	}


	/**
	 * Load task modules from a glob pattern.
	 */
	function loadModulesFromPattern(pattern) {

		lib.glob.sync(pattern).forEach(function(path) {
			loadModuleFromPath(path);
		});

	}


	/**
	 * Load tasks.
	 */
	function load(module, name, config) {

		// Handle name/config arguments
		if (arguments.length === 2) {
			if (typeof name === 'object' || typeof name === 'function') {
				config = name;
				name = null;
			}
		}

		// Module is a string
		if (typeof module === 'string') {

			// String is a glob pattern
			if (lib.glob.hasMagic(module)) {

				if (arguments.length > 1) {
					throw new Error('Can not specify task name/config when loading from a glob pattern');
				}

				return loadModulesFromPattern(module);

			}

			// String is a path
			return loadModuleFromPath(module, name, config);

		}

		// Module is a function
		loadModule(module, name, config);

	}


	// Public API
	return load;

}



// Export public API
module.exports = {
	bind: bind,
};
