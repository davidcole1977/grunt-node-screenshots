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

    function getCroppedShotFileName (page, viewport, selector) {
      return options.screenshotDir + '/' + page.name + '_' + viewport.width + 'x' + viewport.height + '_' + selector.name + '.png';
    }

    function getFullShotFileName (page, viewport) {
      return options.screenshotDir + '/' + page.name + '_' + viewport.width + 'x' + viewport.height + '.png';
    }

    function cropScreenshot (page, viewport, selector, callback) {
      var selectorFileName = getCroppedShotFileName(page, viewport, selector),
          fullShotFileName = getFullShotFileName(page, viewport);

      client.getElementSize(selector.selector, function(error, elementSize) {
        
        client.getLocation(selector.selector, function(error, elementLocation) {
          gm(fullShotFileName).crop(elementSize.width, elementSize.height, elementLocation.x, elementLocation.y).write(selectorFileName, function (error) {
            grunt.log.ok('Saved screenshot: ' + selectorFileName);
            callback();
          });

        });

      });  

    }

    function screenshotPage (page, viewport, selectors, callback) {
      var fullShotFileName = getFullShotFileName(page, viewport);

      client.saveScreenshot(fullShotFileName, function () {
        grunt.log.ok('Saved screenshot: ' + fullShotFileName);

        loopSelectors(page, viewport, _.cloneDeep(selectors), callback);
      });
    }

    function loopSelectors (page, viewport, selectors, callback) {
      var selector;

      if (selectors.length === 0) {
        callback();
      } else {
        selector = selectors.shift();

        cropScreenshot(page, viewport, selector, function () {
          loopSelectors(page, viewport, selectors, callback);
        });
      }
    }

    function loopViewports (page, viewports, callback) {
      var viewport;

      if (viewports.length === 0) {
        callback();
      } else {
        viewport = viewports.shift();

        client.setViewportSize({ width: parseInt(viewport.width, 10), height: parseInt(viewport.height, 10) }, function () {
          screenshotPage(page, viewport, page.selectors, function () {
            loopViewports(page, viewports, callback);
          });
        });
      }
    }

    function loopScreens (pages, callback) {
      var page;

      if (pages.length === 0) {
        callback();
      } else {
        page = pages.shift();

        client.url(page.url, function () {
          loopViewports(page, _.cloneDeep(viewports), function () {
            loopScreens(pages, callback);
          });
        });
      }
    }

    // initialise webdriver
    client = webdriverio.remote(webdriverOptions);
    client.init();

    // initialise the screen capture
    loopScreens(_.cloneDeep(pages), done);

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
