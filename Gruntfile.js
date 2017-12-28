module.exports = function(grunt) {
	'use strict';

	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
		realFavicon: {
			favicons: {
				src: 'src/logo.png',
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

	grunt.loadNpmTasks('grunt-real-favicon');

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['realFavicon', 'uglify', 'cssmin', 'jshint']);
};