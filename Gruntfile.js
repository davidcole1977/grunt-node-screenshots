module.exports = function(grunt) {

  grunt.registerTask('baseline-shot', function () {
    var webshot = require('webshot'),
        done = this.async(),
        screenshotConfig = grunt.file.readJSON('feature-shot-config.json');

    webshot('google.com', 'reporting/screenshots/baseline/google.png', function(err) {
      done();
    });
  });

  grunt.registerTask('latest-shot', function () {
    var webshot = require('webshot'),
        done = this.async(),
        screenshotConfig = grunt.file.readJSON('feature-shot-config.json');

    webshot('google.com', 'reporting/screenshots/latest/google.png', function(err) {
      done();
    });
  });
 
  // Add the grunt-mocha-test tasks. 
  grunt.loadNpmTasks('grunt-mocha-test');
 
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file 
          quiet: false, // Optionally suppress output to standard out (defaults to false) 
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false) 
        },
        src: ['test/**/*.spec.js']
      }
    }
  });
 
  grunt.registerTask('default', ['baseline-shot', 'latest-shot', 'mochaTest']);
 
};