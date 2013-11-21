/*global module:false*/
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: { jshintrc: 'js-src/.jshintrc' },
			files: [ 'js-src/**/*.js', '!js-src/lib/**' ]
		},

		concat: {
			lib:      { files: { 'js/lib.min.js'     : 'js-src/lib/*.js'    }},
			dropdown: { files: { 'js/dropdown.min.js': 'js-src/dropdown.js' }},
			app:      { files: { 'js/app.min.js'     : 'js-src/app/*.js'    }}
		},

		uglify: {
			dropdown : '<%= concat.dropdown %>',
			app : '<%= concat.app %>'
		},

		less: {
			dev: {
				options: { compress: true, paths: [ 'less' ] },
				files: { 'css/style.css' : 'less/**/*.less' }
			},
			prod: {
				options: { yuicompress: true, paths: '<%= less.dev.options.paths %>' },
				files: '<%= less.dev.files %>'
			}
		},

		qunit: { files: ['tests/*.html'] },

		watch: {
			options: { livereload: true },
			js:   { files: 'js-src/**/*.js', tasks: ['jshint', 'concat' ] },
			css: { files: 'less/**/*.less', tasks: [ 'less:dev' ] }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');

	grunt.registerTask('default', [ 'jshint', 'concat', 'less:dev' ]);
	grunt.registerTask('prod', [ 'jshint', 'concat', 'uglify', 'less:prod', 'qunit' ]);
};