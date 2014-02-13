/*global module:false*/
module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			options: { jshintrc: 'js-src/.jshintrc', reporter: require('jshint-stylish') },
			files: [ 'js-src/**/*.js', 'tests/*.js', '!js-src/lib/**' ]
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
				options: { paths: [ 'less' ], compress: false, sourceMap: true, dumpLineNumbers: 'mediaquery' },
				files: { 'css/style.css' : 'less/**/*.less' }
			},
			prod: {
				options: { yuicompress: true, paths: '<%= less.dev.options.paths %>' },
				files: '<%= less.dev.files %>'
			}
		},

		qunit: { files: ['tests/*.html'] },

		blanket_qunit: {
			all: {
				options: { urls: ['tests/index.html?coverage=true&gruntReport'], threshold: 70 }
			}
		},

		watch: {
			options: { livereload: true },
			js:    { files: 'js-src/**/*.js', tasks: ['jshint', 'concat' ] },
			css:   { files: 'less/**/*.less', tasks: [ 'less:dev' ] },
			tests: { files: 'tests/*.js',     tasks: [ 'jshint', 'blanket_qunit' ] }
		}
	});

	grunt.loadNpmTasks('grunt-blanket-qunit');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');

	grunt.registerTask('default', [ 'jshint', 'concat', 'less:dev' ]);
	grunt.registerTask('test', [ 'jshint', 'qunit', 'blanket_qunit' ]);
	grunt.registerTask('prod', [ 'jshint', 'concat', 'uglify', 'less:prod', 'qunit', 'blanket_qunit' ]);
};