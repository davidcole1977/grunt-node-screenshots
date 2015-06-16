module.exports = function(grunt) {

  var _ = require('lodash'),
      screenshotOptions = require('./screenshot-options'),
      baselineScreenshotOptions = _.extend(_.cloneDeep(screenshotOptions), {screenshotDir: 'reporting/screenshots/baseline'}),
      latestScreenshotOptions = _.extend(_.cloneDeep(screenshotOptions), {screenshotDir: 'reporting/screenshots/latest'});
 
  // Add the grunt-mocha-test tasks. 
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-selenium-webdriver');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // takescreens task
  require('./takescreens')(grunt);

  // task timer
  require('time-grunt')(grunt);
 
  grunt.initConfig({
    mkdir: {
     'baseline-screens': {
        options: {
          create: ['reporting/screenshots/baseline/originals']
        }
      },
      'latest-screens': {
        options: {
          create: ['reporting/screenshots/latest/originals']
        }
      },
      'default-screens': {
        options: {
          create: ['screenshots/originals']
        }
      },
      'diff-screens': {
        options: {
          create: ['reporting/screenshots/diffs']
        }
      }
    },
    clean: {
      'baseline-screens': {
        src: ['reporting/screenshots/baseline']
      },
      'latest-screens': {
        src: ['reporting/screenshots/latest']
      },
      'diff-screens': {
        src: ['reporting/screenshots/diffs']
      },
      'default-screens': {
        src: ['screenshots']
      },
    },
    takescreens: {
      baseline: {
        options: baselineScreenshotOptions
      },
      latest: {
        options: latestScreenshotOptions
      },
      no_options: {

      }
    },
    mochaTest: {
      'screen-diff': {
        src: ['test/**/*.spec.js']
      }
    }
  });

  grunt.registerTask('baseline-screens', [
    'selenium_phantom_hub',
    'takescreens:baseline',
    'selenium_stop'
  ]);

  grunt.registerTask('latest-screens', [
    'selenium_phantom_hub',
    'takescreens:latest',
    'selenium_stop'
  ]);

  grunt.registerTask('default-screens', [
    'selenium_phantom_hub',
    'takescreens:no_options',
    'selenium_stop'
  ]);

  grunt.registerTask('screen-diff', [
    'clean:diff-screens',
    'mkdir:diff-screens',
    'mochaTest:screen-diff'
  ]);
 
};
