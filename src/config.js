'use strict';

// Include dependencies
var extend = require('extend');


// Private API
// ---------------------------------------------------------


/**
 * Get a named configuration hash.
 */
function getConfig(gelf, name) {

	var fn = gelf._configFn[name];

	return extend(true,
		fn ? fn((name !== 'global') ? getConfig(gelf, 'global') : {}) : {},
		gelf._config[name] || {}
	);

}

/**
 * Get all configuration hashes.
 */
function getAllConfig(gelf) {

	var out = {};

	[gelf._config, gelf._configFn].forEach(function(config) {

		for (var name in config) {
			if (out[name] == null) {
				out[name] = getConfig(gelf, name);
			}
		}

	});

	return out;

}


/**
 * Set the configuration provider for a named module.
 */
function setConfigFunction(gelf, name, fn) {

	gelf._configFn[name] = fn;

}


/**
 * Set configuration for a named module.
 */
function setConfig(gelf, name, config, reset) {

	gelf._config[name] = (reset || typeof config !== 'object') ?
		config :
		extend(true, gelf._config[name] || {}, config || {});

}


// Public API
// ---------------------------------------------------------

/**
 * Get or set configuration.
 */
module.exports = function(name, config, reset) {

	var gelf = this;

	if (arguments.length === 0) {
		return getAllConfig(gelf);
	}

	if (arguments.length === 1) {
		return getConfig(gelf, name);
	}

	if (typeof config === 'function') {
		setConfigFunction(gelf, name, config);
	}

	setConfig(gelf, name, config, reset);

};
