'use strict';

module.exports = function(gelf, name) {

	name = name || 'dump:tasks';

	/**
	 * Task: Dump all tasks.
	 */
	gelf.task(name, function() {

		var allTasks = {
			Tasks: Object.keys(gelf.gulp.tasks),
		};

		console.log(require('prettyjson').render(allTasks));

	});

	return name;

};
