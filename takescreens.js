module.exports = function (grunt) {

  grunt.registerMultiTask('takescreens', 'uses webdriverio / phantomjs to save screenshots of each page, at the a range of viewport dimensions, cropping to the specified page regions', function () {
    var loop = require('./looper').loop,
        gm = require('gm'),
        _ = require('lodash'),
        finishGruntTask = this.async(),
        options = this.options({
          screenshotDir: 'screenshots',
          viewports: [
            {
              width: 1024,
              height: 768
            }
          ],
          pages: [
            {
              name: "Tesco Bank Home",
              url: "http://www.tescobank.com",
            }
          ]
        }),
        webdriverio = require('webdriverio'),
        webdriverOptions = {
          desiredCapabilities: {
            browserName: 'phantomjs'
          },
          logLevel: 'silent'
        },
        client;

    /**
     * returns the file name for the whole page version of a web page screenshot
     */
    function getFullShotFileName (pageName, viewport) {
      return options.screenshotDir + '/originals/' + pageName + '_' + viewport.width + 'x' + viewport.height + '_full-page.png';
    }

    /**
     * returns the file name for the cropped version of a web page screenshot
     */
    function getCroppedShotFileName (pageName, viewport, selectorName) {
      return options.screenshotDir + '/' + pageName + '_' + viewport.width + 'x' + viewport.height + '_' + selectorName + '.png';
    }

    /**
     * saves the current web page as a screenshot and then calls the callback function
     */
    function takeScreenshot (fileName, callback) {
      client.saveScreenshot(fileName, function (error) {
        grunt.log.ok('Saved screenshot: ' + fileName);
        callback();
      });
    }

    /**
     * crop the specified web page screenshot image file (options.fileName) to the specified CSS selector
     * and saves the resulting image to the screenshots directory, calling the callback function when finished
     */
    function cropScreenshot (selector, options, callback) {
      var croppedFileName = getCroppedShotFileName(options.page.name, options.viewport, selector.name);

      client.getElementSize(selector.selector, function (error, elementSize) {
        
        client.getLocation(selector.selector, function (error, elementLocation) {
          gm(options.fileName).crop(elementSize.width, elementSize.height, elementLocation.x, elementLocation.y).write(croppedFileName, function (error) {
            grunt.log.ok('Saved screenshot: ' + croppedFileName);
            callback();
          });
        });

      });  

    }

    /**
     * sets the viewport to the specified dimensions, calls the optional specified action function,
     * then calls the takeScreenshot function, after which it loops through the specified selectors
     */
    function setViewport (viewport, page, callback) {
      var fileName = getFullShotFileName(page.name, viewport);

      var takeScreenshotThenLoopSelectors = function () {
        takeScreenshot(fileName, function () {
          loop(page.selectors).andDo(cropScreenshot).withData({fileName: fileName, page: page, viewport: viewport}).andWhenFinished(callback).start();
        });
      };

      client.setViewportSize({ width: viewport.width, height: viewport.height }, function (error) {
        if (typeof page.action === 'function') {
          page.action(client, {page: page, viewport: viewport}, function (error) {
            takeScreenshotThenLoopSelectors();
          });
        } else {
          takeScreenshotThenLoopSelectors();
        }
      });

    }

    /**
     * loops through pages – for each page, loops through the viewports, calling the setViewport function
     */
    function setURL (page, viewports, callback) {
      client.url(page.url, function (error) {
        loop(viewports).andDo(setViewport).withData(page).andWhenFinished(callback).start();
      });
    }

    // clean and create screenshot directory
    if (grunt.file.isDir(options.screenshotDir)) {
      grunt.file.delete(options.screenshotDir);
       grunt.log.writeln('Cleaned screenshot directory ', options.screenshotDir);
    }
    grunt.file.mkdir(options.screenshotDir + '/originals');
    grunt.log.writeln('Created screenshots directory ', options.screenshotDir);

    // initialise webdriver
    client = webdriverio.remote(webdriverOptions);
    client.init();

    // initialise the screen capture
    loop(options.pages).andDo(setURL).withData(options.viewports).andWhenFinished(finishGruntTask).start();
  });

};