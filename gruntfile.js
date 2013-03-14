/*global module:false*/
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				bitwise   : true,
				boss      : true,
				//camelcase : true,
				eqeqeq    : true,
				immed     : true,
				indent    : 4,
				latedef   : true,
				maxlen    : 130,
				newcap    : true,
				noarg     : true,
				noempty   : true,
				nonew     : true,
				quotmark  : true,
				smarttabs : true,
				//strict    : true,
				trailing  : true,
				//undef     : true,
				//unused    : true,
				white     : true,
				browser   : true,
				jquery    : true,
				globals: {}
			},
			files: [ 'js-src/**/*.js', '!js-src/lib/**' ]
		},

		concat: {
			jquery:  { src: ['js-src/lib/*.js' ],    dest: 'js/jquery.min.js' },
			widgets: { src: ['js-src/widgets/*.js'], dest: 'js/widgets.js' },
			modules: { src: ['js-src/modules/*.js'], dest: 'js/modules.js' },
			app:     { src: ['js-src/app/*.js'],     dest: 'js/app.js' }
		},

		uglify: {
			widgets : '<%= concat.widgets %>',
			modules : '<%= concat.modules %>',
			app     : '<%= concat.app %>'
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

		watch: {
			js:   { files: 'js-src/**/*.js', tasks: ['jshint', 'concat' ] },
			css: { files: 'less/**/*.less', tasks: [ 'less:dev' ] }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'concat', 'less:dev' ]);
	grunt.registerTask('prod', [ 'jshint', 'concat', 'uglify', 'less:prod' ]);
};