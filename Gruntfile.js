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

    function takeScreenshot(viewport, page, selectors, callback) {
      client.saveScreenshot(options.screenshotDir + '/' + page.name + '_' + viewport.width + 'x' + viewport.height + '.png', function () {
        selectors.forEach(function (selector) {
          console.log('takeScreenshot: ' + page.name + ', ' + viewport.width + 'x' + viewport.height + ', ' + selector.name);
        });   

        callback();
      });
    }

    function loopViewports (viewports, page, callback) {
      var viewport;

      if (viewports.length === 0) {
        callback();
      } else {
        viewport = viewports.shift();

        client.setViewportSize({ width: parseInt(viewport.width, 10), height: parseInt(viewport.height, 10) }, function () {
          takeScreenshot(viewport, page, _.cloneDeep(page.selectors), function () {
            loopViewports(viewports, page, callback);
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
          loopViewports(_.cloneDeep(viewports), page, function () {
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
 
  grunt.initConfig({
    takescreens: {
      baseline: {
        options: {
          screenshotDir: 'reporting/screenshots/baseline-new',
          configFile: 'feature-shot-config.json'
        }
      },
      latest: {
        options: {
          screenshotDir: 'reporting/screenshots/latest-new',
          configFile: 'feature-shot-config.json'
        }
      }
    },
    mochaTest: {
      'screen-diff': {
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

  grunt.registerTask('baseline-screens', ['selenium_phantom_hub', 'takescreens:baseline', 'selenium_stop']);
 
};
