module.exports = function(grunt) {

  grunt.registerMultiTask('takescreens', function () {
    var options = this.options({
          screenshotDir: 'screenshots',
          configFile: 'feature-shot-config.json'
        }),
        webshot = require('webshot'),
        finishTask = this.async(),
        screenshotConfig = grunt.file.readJSON(options.configFile),
        pages = screenshotConfig.pages,
        viewports = screenshotConfig.viewports,
        pageNames = Object.keys(screenshotConfig.pages),
        totalScreenshots = 0,
        screenshotCount = 0;

    // determine total number of screenshots so we can tell when we're finished
    totalScreenshots = pageNames.length * viewports.length;

    pageNames.forEach(function (pageName) {
      totalScreenshots += pages[pageName].selectors.length;
    });

    // loop through selectors, viewports & IDs for each page and save a screenshot
    pageNames.forEach(function (pageName) {

      screenshotConfig.viewports.forEach(function (viewport) {
        var selectors = pages[pageName].selectors,
            viewportString = viewport.width + 'x' + viewport.height;

        Object.keys(selectors).forEach(function (selectorName) {
          var screenshotPath = options.screenshotDir + '/' + pageName + '_' + viewportString + '_' + selectorName + '.png',
              webshotOptions = {
                windowSize: {
                  width: viewport.width,
                  height: viewport.height
                },
                shotSize: {
                  width: 'window',
                  height: 'all'
                },
                defaultWhiteBackground: true
              };

          webshot(pages[pageName].url, screenshotPath, webshotOptions, function (error) {
            if (error) {
              grunt.log.error(error);
            } else {
              grunt.log.ok('Screenshot saved at ' + screenshotPath);
            }

            screenshotCount += 1;
            if (screenshotCount === totalScreenshots) {
              finishTask();
            }
          });
        });
      });
    });
  });
 
  // Add the grunt-mocha-test tasks. 
  grunt.loadNpmTasks('grunt-mocha-test');
 
  grunt.initConfig({
    takescreens: {
      baseline: {
        options: {
          screenshotDir: 'reporting/screenshots/baseline',
          configFile: 'feature-shot-config.json'
        }
      },
      latest: {
        options: {
          screenshotDir: 'reporting/screenshots/latest',
          configFile: 'feature-shot-config.json'
        }
      }
    },
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