'use strict';

var expect = require('chai').expect,
    resemble = require('node-resemble-js'),
    fs = require('fs'),
    path = require('path'),
    appDir = path.dirname(require.main.filename),
    screenshotConfig = require('../feature-shot-config');

describe('screen diffing tests', function () {

  it('compares a single screenshot', function (done) {

    resemble('reporting/screenshots/baseline/google.png').compareTo('reporting/screenshots/latest/google.png').ignoreAntialiasing().onComplete(function (diffData) {
      
      if (diffData.misMatchPercentage > 0.1) {
        var imageStream = diffData.getDiffImage().pack();
        imageStream.pipe(fs.createWriteStream('reporting/screenshots/differences/google.png'));
        imageStream.on('end', function () {
          throw new Error('baseline screenshot is different from latest screenshot');
        });
      } else {
        done();
      }

    });

  });

});