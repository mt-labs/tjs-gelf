'use strict';

// Constants
const CONFIG_FILENAME = '.tjs-gelf';

// Cached load result
var loadedArgs = null;


/**
 * Load system configuration from ".tjs-gelf" files.
 */
function load() {

	// Dependencies
	var extend = require('extend');
	var fs = require('fs');
	var path = require('path');

	var paths = [];

	// Add current and all parent directories to the search list
	var lastDir, currentDir = process.cwd();
	while (currentDir !== lastDir) {
		paths.push(path.normalize(currentDir + '/' + CONFIG_FILENAME));
		lastDir = currentDir;
		currentDir = path.dirname(currentDir);
	}

	// Add home directory to the search list
	var homeDir = require('user-home');
	if (homeDir) {
		paths.push(path.normalize(homeDir + '/' + CONFIG_FILENAME));
	}

	var config = {};

	paths.forEach(function(path) {

		var fileContent;

		// Try to read the file
		try {
			fileContent = fs.readFileSync(path, 'utf8');
		}
		catch (error) {
			// Ignore errors
		}

		// Try to parse the file
		try {
			if (fileContent) {
				config = extend(true, JSON.parse(fileContent), config);
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
function get(name) {

	if (loadedArgs == null) {
		loadedArgs = load();
	}

	// Signature: get()
	//   Get all config
	if (arguments.length === 0) {
		return loadedArgs;
	}

	// Signature: get(name)
	//   Get config for the named module
	return loadedArgs[name];

}


// Export public API
module.exports = get;
