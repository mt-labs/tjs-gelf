'use strict';

// Include dependencies
var lib = {
	extend: require('extend'),
	fs: require('fs'),
	path: require('path'),
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
function loadArgsConfig() {

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
 * Get CLI configuration.
 */
function getArgsConfig(name) {

	if (getArgsConfig._config == null) {
		getArgsConfig._config = loadArgsConfig();
	}

	// Signature: getArgsConfig()
	//   Get all args
	if (arguments.length === 0) {
		return getAllConfig(gelf);
	}

	// Signature: getArgsConfig(name)
	//   Get args for the named config
	return getArgsConfig._config[name] || {};

}


/**
 * Load system configuration from ".tjs-gelf" files.
 */
function loadSystemConfig() {

	var fileName = '.tjs-gelf';

	var paths = [];

	// Add current and all parent directories to the search list
	var lastDir, currentDir = process.cwd();
	while (currentDir !== lastDir) {
		paths.push(lib.path.normalize(currentDir + '/' + fileName));
		lastDir = currentDir;
		currentDir = lib.path.dirname(currentDir);
	}

	// Add home directory to the search list
	var homeDir = require('user-home');
	if (homeDir) {
		paths.push(lib.path.normalize(homeDir + '/' + fileName));
	}

	var config = {};

	paths.forEach(function(path) {

		var fileContent;

		// Try to read the file
		try {
			fileContent = lib.fs.readFileSync(path, 'utf8');
		}
		catch (error) {
			// Ignore errors
		}

		// Try to parse the file
		try {
			if (fileContent) {
				config = lib.extend(true, JSON.parse(fileContent), config);
			}
		}
		catch (error) {
			console.warn('Error parsing file at "%s": %s', path, error.stack);
		}

	});

	return config;

}


/**
 * Get system configuration.
 */
function getSystemConfig(name) {

	if (getSystemConfig._config == null) {
		getSystemConfig._config = loadSystemConfig();
	}

	// Signature: getSystemConfig()
	//   Get all config
	if (arguments.length === 0) {
		return getAllConfig(gelf);
	}

	// Signature: getSystemConfig(name)
	//   Get config for the named module
	return getSystemConfig._config[name] || {};

}


/**
 * Get configuration for a named module.
 */
function getConfig(gelf, name) {

	var initial = (name !== 'global')
		? getConfig(gelf, 'global')
		: {};

	var configurators = (gelf._config[name] || []).concat([
		getSystemConfig(name),
		getArgsConfig(name),
	]);

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
 * Get configuration for all modules.
 */
function getAllConfig(gelf) {

	var out = {};

	Object.keys(gelf._config).map(function(name) {
		out[name] = getConfig(gelf, name);
	});

	return out;

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
