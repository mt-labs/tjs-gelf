'use strict';

// Cached load result
var loadedArgs = null;


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


/**
 * Parse CLI arguments into an object.
 */
function load() {

	var minimist = require('minimist');

	var out = {};
	var argv = minimist(process.argv.slice(2));

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
function get(name) {

	if (loadedArgs == null) {
		loadedArgs = load();
	}

	// Signature: get()
	//   Get all args
	if (arguments.length === 0) {
		return loadedArgs;
	}

	// Signature: get(name)
	//   Get args for the named config
	return loadedArgs[name];

}


// Export public API
module.exports = get;
