'use strict';

var expect = require('chai').expect,
    fs = require('fs'),
    gm = require('gm'),
    baselineDir = 'reporting/screenshots/baseline',
    latestDir = 'reporting/screenshots/latest',
    diffDir = 'reporting/screenshots/differences',
    baselineFileNames = fs.readdirSync(baselineDir),
    latestFileNames = fs.readdirSync(latestDir),
    filteredBaselineFileNames;

// filter out files that don't have a .png extension
filteredBaselineFileNames = baselineFileNames.filter(function (fileName) {
  if (/\.png$/.test(fileName)) {
    return true;
  } else {
    return false;
  }
});

describe('compare baseline screenshots to latest screenshots', function () {

  filteredBaselineFileNames.forEach(function (fileName) {

    describe(fileName, function () {

      it('matches the latest version of the screenshot', function (done) {
        var hasMatchingLatestFileName = (latestFileNames.indexOf(fileName) !== -1) ? true : false;

        // early out if there is no matching 'latest' screenshot
        if (!hasMatchingLatestFileName) {
          throw new Error('there is no matching latest screenshot file – have you run the baseline images screenshot task?');
        }

        gm.compare(baselineDir + '/' + fileName, latestDir + '/' + fileName, 0.01 / 100, function (error, imagesAreEqual, imageDiffAmount) {
          if (error) {
            throw error;
          }

          if (!imagesAreEqual) {
            var diffSaveOptions = {
              file: 'reporting/screenshots/diffs/' + fileName
            };

            gm.compare(baselineDir + '/' + fileName, latestDir + '/' + fileName, diffSaveOptions, function (error) {
              if (error) {
                console.log(error);
              }

              throw new Error('baseline screenshot is ' + Math.round(imageDiffAmount * 100 * 100) / 100  + '% different from latest screenshot');
            });
            
          } else {
            done();
          }
        });

      });

    });
    
  });

});