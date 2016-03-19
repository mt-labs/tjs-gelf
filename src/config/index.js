'use strict';

function bind(gelf) {

	var allConfig = {};


	/**
	 * Get configuration for a named module.
	 */
	function getConfig(name) {

		var extend = require('extend');

		var configurators = (allConfig[name] || []).concat([
			require('./from-system')(name),
			require('./from-args')(name),
		]);

		var get = getConfig.bind(null, gelf);

		return configurators.reduce(function(config, current) {

			if (current == null) {
				return config;
			}

			if (typeof current === 'function') {
				let result = current.call(null, config, get);
				return (result != null) ? result : config;
			}

			if (typeof current === 'object') {
				return (typeof config === 'object') ? extend(true, config, current) : current;
			}

			return current;

		}, null);

	}


	/**
	 * Get configuration for all modules.
	 */
	function getAll() {

		var out = {};

		Object.keys(allConfig).map(function(name) {
			out[name] = getConfig(name);
		});

		return out;

	}


	/**
	 * Set configuration for a named module.
	 */
	function setConfig(name, config) {

		if (allConfig[name] == null) {
			allConfig[name] = [];
		}

		allConfig[name].push(config);

	}


	/**
	 * Get configuration.
	 */
	function get(name, config) {

		// Signature: config()
		//   Get all config
		if (arguments.length === 0) {
			return getAll();
		}

		// Signature: config(name)
		//   Get config for the named module
		if (arguments.length === 1) {
			return getByName(name);
		}

		// Signature: config(name, config)
		//   Set configuration data for a named module
		setConfig(name, config);

	};


	// Public API
	return get;

};


// Export public API
module.exports = {
	bind: bind,
};
