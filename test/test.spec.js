'use strict';

var expect = require('chai').expect,
    webshot = require('webshot'),
    resemble = require('node-resemble-js'),
    fs = require('fs');

describe('pointless test', function () {

  it('does pointless things', function (done) {

    // THIS CODE IS CRAP - IT WAS PURELY FOR INVESTIGATION PURPOSES AND IS COMPLETELY UNSUITABLE
    // RETAINING FOR REFRENCE ONLY UNTIL I HAVE THE CHANCE TO WRITE A SUITABLE PROTOTYPE

    webshot('google.com', 'google.png', function(err) {
      // screenshot now saved to google.png
    });

    webshot('google.com', 'google-2.png', function(err) {
      // screenshot now saved to google.png
    });

    var diff = resemble('google.png').compareTo('google-2.png').ignoreAntialiasing().onComplete(function (diffData) {
      diffData.getDiffImage().pack().pipe(fs.createWriteStream('diff.png'));
      done();

      // more info about writing the data as a png file here
      // http://stackoverflow.com/questions/28746451/writing-buffer-response-from-resemble-js-to-file
      // https://github.com/lksv/node-resemble.js/issues/4
      // done();
      /*
      {
        misMatchPercentage : 100, // %
        isSameDimensions: true, // or false
        dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
        getImageDataUrl: function(){}
      }
      */
    });

  });

});