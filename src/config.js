'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
};

// var argv = require('minimist')(process.argv.slice(2));


// Private API
// ---------------------------------------------------------

/**
 * Get a named configuration objects.
 */
function getConfig(gelf, name) {

	var initial = (name !== 'global')
		? getConfig(gelf, 'global')
		: {};

	return (gelf._config[name] || []).reduce(function(config, current) {

		return (typeof current === 'function') ?
			current.call(null, config, lib.extend) || config :
			lib.extend(true, config, current);

	}, initial);

}


/**
 * Get all configuration objects.
 */
function getAllConfig(gelf) {

	return Object.keys(gelf).map(getConfig.bind(null, gelf));

}


/**
 * Set configuration for a named module.
 */
function setConfig(gelf, name, config) {

	if (gelf._config[name] == null) {
		gelf._config[name] = [];
	}

	gelf._config[name].push(config);

}


// Public API
// ---------------------------------------------------------

/**
 * Get or set configuration.
 */
module.exports = function(name, config) {

	var gelf = this;

	// Prepare Gelf instance
	if (gelf._config == null) {
		gelf._config = {};
	}

	// Signature: config()
	//   Get all config
	if (arguments.length === 0) {
		return getAllConfig(gelf);
	}

	// Signature: config(name)
	//   Get config for the named module
	if (arguments.length === 1) {
		return getConfig(gelf, name);
	}

	// Signature: config(name, config)
	//   Set configuration data for a named module
	setConfig(gelf, name, config);

};
