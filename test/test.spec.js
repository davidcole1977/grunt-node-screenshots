'use strict';

var expect = require('chai').expect,
    resemble = require('node-resemble-js'),
    fs = require('fs'),
    path = require('path'),
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
      
      it('has a matching "latest" screenshot file', function () {
        var hasMatchingLatestFileName = (latestFileNames.indexOf(fileName) !== -1) ? true : false;

        // this will be turned into a proper assertion
        if (!hasMatchingLatestFileName) {
          throw new Error('there is no matching latest screenshot file – have you run the baseline images screenshot task?');
        }
      });

      it('matches the latest version of the screenshot', function (done) {
        var hasMatchingLatestFileName = (latestFileNames.indexOf(fileName) !== -1) ? true : false;

        // early out if there is no matching 'latest' screenshot
        if (!hasMatchingLatestFileName) {
          throw new Error('there is no matching latest screenshot file – have you run the baseline images screenshot task?');
          done();
        }

        resemble(baselineDir + '/' + fileName).compareTo(latestDir + '/' + fileName).onComplete(function (diffData) {
          
          // this will be turned into a proper assertion
          if (diffData.misMatchPercentage > 0.1) {
            var imageStream = diffData.getDiffImage().pack();

            imageStream.pipe(fs.createWriteStream(diffDir + '/' + fileName));

            imageStream.on('end', function () {
              throw new Error('baseline screenshot is different from latest screenshot');
            });
          } else {
            done();
          }

        });
      });

    });
    
  });

});