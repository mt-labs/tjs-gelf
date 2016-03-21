'use strict';

module.exports = function(gelf, name) {

	name = name || 'dump:config';

	/**
	 * Task: Dump all configuration.
	 */
	gelf.task(name, function() {

		var allConfig = {
			Configuration: gelf.config(),
		};

		console.log(require('prettyjson').render(allConfig));

	});

	return name;

};
