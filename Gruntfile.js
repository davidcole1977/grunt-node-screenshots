module.exports = function(grunt) {

  grunt.registerMultiTask('takescreens', function () {
    var _ = require('lodash'),
        gm = require('gm'),
        options = this.options({
          screenshotDir: 'screenshots',
          configFile: 'feature-shot-config.json'
        }),
        webdriverio = require('webdriverio'),
        webdriverOptions = {
          desiredCapabilities: {
            browserName: 'phantomjs'
          },
          logLevel: 'silent'
        },
        client,
        done = this.async(),
        screenshotConfig = grunt.file.readJSON(options.configFile),
        pages = screenshotConfig.pages,
        viewports = screenshotConfig.viewports;

    function loopWithCallback (array, action, finished) {
      var entry;

      if (array.length === 0) {
        finished();
      } else {
        entry = array[0];

        action(entry, function () {
          loopWithCallback(array.slice(1), action, finished)
        });
      }
    }

    function getCroppedShotFileName (pageName, viewport, selectorName) {
      return options.screenshotDir + '/' + pageName + '_' + viewport.width + 'x' + viewport.height + '_' + selectorName + '.png';
    }

    function getFullShotFileName (pageName, viewport) {
      return options.screenshotDir + '/' + pageName + '_' + viewport.width + 'x' + viewport.height + '_full-page.png';
    }

    function cropScreenshot (originalFileName, croppedFileName, selector, callback) {
      client.getElementSize(selector.selector, function(error, elementSize) {
        
        client.getLocation(selector.selector, function(error, elementLocation) {
          gm(originalFileName).crop(elementSize.width, elementSize.height, elementLocation.x, elementLocation.y).write(croppedFileName, function (error) {
            grunt.log.ok('Saved screenshot: ' + croppedFileName);
            callback();
          });
        });

      });  

    }

    function loopSelectors (page, viewport, callback) {
      loopWithCallback(page.selectors, function (selector, done) {
        var selectorFileName = getCroppedShotFileName(page.name, viewport, selector.name),
            fullShotFileName = getFullShotFileName(page.name, viewport);

        cropScreenshot(fullShotFileName, selectorFileName, selector, function () {
          done();
        });

      }, callback);
    }

    function screenshotPage (page, viewport, callback) {
      var fullShotFileName = getFullShotFileName(page.name, viewport);

      client.saveScreenshot(fullShotFileName, function () {
        grunt.log.ok('Saved screenshot: ' + fullShotFileName);

        loopSelectors(page, viewport, callback);
      });
    }
    
    function setViewports (page, viewports, callback) {
      loopWithCallback(viewports, function (viewport, done) {

        client.setViewportSize({ width: parseInt(viewport.width, 10), height: parseInt(viewport.height, 10) }, function () {
          screenshotPage(page, viewport, function () {
            done();
          });
        });

      }, callback);
    }

    function startScreenCapture (pages, callback) {
      loopWithCallback(pages, function (page, done) {

        client.url(page.url, function () {
          setViewports(page, viewports, function () {
            done();
          });
        });

      }, callback);
    }

    // initialise webdriver
    client = webdriverio.remote(webdriverOptions);
    client.init();

    // initialise the screen capture
    startScreenCapture(pages, done);
  });
 
  // Add the grunt-mocha-test tasks. 
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-selenium-webdriver');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // task timer
  require('time-grunt')(grunt);
 
  grunt.initConfig({
    mkdir: {
     'baseline-screens': {
        options: {
          create: ['reporting/screenshots/baseline']
        }
      },
      'latest-screens': {
        options: {
          create: ['reporting/screenshots/latest']
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
      }
    },
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
      'screen-diff': {
        options: {
          reporter: 'spec',
          captureFile: 'reporting/screenshots/results.txt', // Optionally capture the reporter output to a file 
          quiet: false, // Optionally suppress output to standard out (defaults to false) 
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false) 
        },
        src: ['test/**/*.spec.js']
      }
    }
  });

  grunt.registerTask('baseline-screens', [
    'clean:baseline-screens',
    'mkdir:baseline-screens',
    'selenium_phantom_hub',
    'takescreens:baseline',
    'selenium_stop'
  ]);

  grunt.registerTask('latest-screens', [
    'clean:latest-screens',
    'mkdir:latest-screens',
    'selenium_phantom_hub',
    'takescreens:latest',
    'selenium_stop'
  ]);

  grunt.registerTask('screen-diff', [
    'clean:diff-screens',
    'mkdir:diff-screens',
    'mochaTest:screen-diff'
  ]);
 
};
