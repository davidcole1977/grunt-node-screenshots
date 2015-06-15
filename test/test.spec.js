'use strict';

var assert = require('chai').assert,
    fs = require('fs'),
    assertImagesAreEqual = require('./assertImagesAreEqual'),
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

  it('baseline screenshot(s) exist', function () {
    assert.isArray(baselineFileNames);
    assert.ok(baselineFileNames.length > 0);
  });

  it('latest screenshot(s) exist', function () {
    assert.isArray(latestFileNames);
    assert.ok(latestFileNames.length > 0);
  });

  filteredBaselineFileNames.forEach(function (fileName) {

    describe(fileName, function () {

      it('latest version of the baseline screenshot exists', function () {
        assert.include(latestFileNames, fileName);
      });

      it('matches the latest version of the screenshot', function (done) {
        assertImagesAreEqual(baselineDir + '/' + fileName, latestDir + '/' + fileName, done);
      });

    });
    
  });

});