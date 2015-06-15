module.exports = function(grunt) {

  grunt.registerMultiTask('takescreens', function () {
    var loop = require('./looper').loop,
        gm = require('gm'),
        finishGruntTask = this.async(),
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
        screenshotConfig = grunt.file.readJSON(options.configFile),
        pages = screenshotConfig.pages,
        viewports = screenshotConfig.viewports;

    function getFullShotFileName (pageName, viewport) {
      return options.screenshotDir + '/originals/' + pageName + '_' + viewport.width + 'x' + viewport.height + '_full-page.png';
    }

    function getCroppedShotFileName (pageName, viewport, selectorName) {
      return options.screenshotDir + '/' + pageName + '_' + viewport.width + 'x' + viewport.height + '_' + selectorName + '.png';
    }

    function takeScreenshot (fileName, callback) {
      client.saveScreenshot(fileName, function (error) {
        grunt.log.ok('Saved screenshot: ' + fileName);
        callback();
      });
    }

    function cropScreenshot (selector, data, callback) {
      var croppedFileName = getCroppedShotFileName(data.page.name, data.viewport, selector.name);

      client.getElementSize(selector.selector, function (error, elementSize) {
        
        client.getLocation(selector.selector, function (error, elementLocation) {
          gm(data.fileName).crop(elementSize.width, elementSize.height, elementLocation.x, elementLocation.y).write(croppedFileName, function (error) {
            grunt.log.ok('Saved screenshot: ' + croppedFileName);
            callback();
          });
        });

      });  

    }

    function setViewport (viewport, page, callback) {
      var fileName = getFullShotFileName(page.name, viewport);

      client.setViewportSize({ width: parseInt(viewport.width, 10), height: parseInt(viewport.height, 10) }, function (error) {
        takeScreenshot(fileName, function () {
          loop(page.selectors).andDo(cropScreenshot).withData({fileName: fileName, page: page, viewport: viewport}).andWhenFinished(callback).start();
        });
      });

    }

    function setURL (page, viewports, callback) {
      client.url(page.url, function (error) {
        loop(viewports).andDo(setViewport).withData(page).andWhenFinished(callback).start();
      });
    }

    // initialise webdriver
    client = webdriverio.remote(webdriverOptions);
    client.init();

    // initialise the screen capture
    loop(pages).andDo(setURL).withData(viewports).andWhenFinished(finishGruntTask).start();
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
          create: ['reporting/screenshots/baseline/originals']
        }
      },
      'latest-screens': {
        options: {
          create: ['reporting/screenshots/latest/originals']
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
