module.exports = function(grunt) {
	'use strict';
	require("load-grunt-tasks")(grunt);

	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
		realFavicon: {
			favicons: {
				src: 'logo/logo.png',
				dest: 'assets/images/icons',
				options: {
					iconsPath: 'assets/images/icons',
					html: [ 'index.html' ],
					design: {
						ios: {
							pictureAspect: 'backgroundAndMargin',
							backgroundColor: '#ffffff',
							margin: '0%',
							assets: {
								ios6AndPriorIcons: false,
								ios7AndLaterIcons: false,
								precomposedIcons: false,
								declareOnlyDefaultIcon: true
							}
						},
						desktopBrowser: {},
						windows: {
							pictureAspect: 'noChange',
							backgroundColor: '#00a300',
							onConflict: 'override',
							assets: {
								windows80Ie10Tile: true,
								windows10Ie11EdgeTiles: {
									small: false,
									medium: true,
									big: false,
									rectangle: false
								}
							}
						},
						androidChrome: {
							pictureAspect: 'noChange',
							themeColor: '#ffffff',
							manifest: {
								name: 'TheOrganicos',
								display: 'standalone',
								orientation: 'notSet',
								onConflict: 'override',
								declared: true
							},
							assets: {
								legacyIcon: false,
								lowResolutionIcons: false
							}
						},
						safariPinnedTab: {
							pictureAspect: 'silhouette',
							themeColor: '#7ABA7A'
						}
					},
					settings: {
						scalingAlgorithm: 'Mitchell',
						errorOnImageTooSmall: false
					}
				}
			}
		},
		"babel": {
		  options: {
		    sourceMap: true
		  },
		  dist: {
		    files: {
		      "assets/dist/js/main.js": "assets/src/js/main.js"
		    }
		  }
		},
		uglify: {
			options: {
				mangle: false
			},  
			js: {
				files: {
					'assets/dist/js/main.min.js' : ['assets/dist/js/main.js']
				}
			}
		},
		cssmin: {
			css: {
				files: {
					'assets/dist/css/main.min.css' : 'assets/src/css/main.css'
				}
			}
		},
		jshint: {
			src: ['assets/src/js/main.js'],
			options: {
        esversion: 6
			}
		}
	};

	grunt.initConfig(gruntConfig);

	grunt.loadNpmTasks('grunt-real-favicon');

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [/*'realFavicon',*/ 'babel' , 'uglify', 'cssmin', 'jshint']);
};
