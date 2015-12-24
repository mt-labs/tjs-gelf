'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
};


// Utilities
// ---------------------------------------------------------

/**
 * Execute a function on all leaves of an object graph.
 */
function recursiveMap(value, callback) {

	if (Array.isArray(value)) {
		return value.map(callback);
	}

	if (typeof value === 'object' || typeof value === 'function') {
		for (var k in value) {
			value[k] = recursiveMap(value[k], callback);
		}
		return value;
	}

	return callback(value);

}


// Private API
// ---------------------------------------------------------

/**
 * Parse CLI arguments into an object.
 */
function parseArgs() {

	var out = {};
	var argv = require('minimist')(process.argv.slice(2));

	for (var k in argv) {
		if (k !== '_') {
			out[k] = argv[k];
		}
	}

	return recursiveMap(out, function(v) {

		if (v === 'true') {
			return true;
		}

		if (v === 'false') {
			return false;
		}

		if (v === 'null') {
			return null;
		}

		if (v === 'undefined') {
			return undefined;
		}

		return v;

	});

}


/**
 * Get CLI arguments for the named configuration.
 */
function getArgs(name) {

	if (getArgs.parsed == null) {
		getArgs.parsed = parseArgs();
	}

	// Signature: getArgs()
	//   Get all args
	if (arguments.length === 0) {
		return getAllConfig(gelf);
	}

	// Signature: getArgs(name)
	//   Get args for the named config
	return getArgs.parsed[name] || {};

}


/**
 * Get a named configuration objects.
 */
function getConfig(gelf, name) {

	var initial = (name !== 'global')
		? getConfig(gelf, 'global')
		: {};

	var configurators = (gelf._config[name] || []).concat([getArgs(name)]);

	return configurators.reduce(function(config, current) {

		if (current == null) {
			return {};
		}

		if (typeof current === 'function') {
			return current.call(null, config, lib.extend) || config;
		}

		return lib.extend(true, config, current);

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
