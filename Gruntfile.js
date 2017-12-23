module.exports = function(grunt) {
	'use strict';

	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
		babel: {
			options: {
				sourceMap: true,
				presets: ['env']
			},
			dist: {
				files: {
					'assets/js/main.js': 'assets/js/main.js'
				}
			}
		},
		uglify: {
			options: {
				mangle: false
			},  
			js: {
				files: {
					'assets/js/main.min.js' : ['assets/js/main.js']
				}
			}
		},
		cssmin: {
			css: {
				files: {
					'assets/css/main.min.css' : 'assets/css/main.css'
				}
			}
		},
		jshint: {
			src: ['assets/js/main.js']
		}
	};

	grunt.initConfig(gruntConfig);

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['uglify', 'cssmin', 'jshint']);
};