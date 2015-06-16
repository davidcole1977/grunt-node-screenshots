var gm = require('gm');

/**
 * given a string, returns the portion that is a PNG image file name
 */
function extractPNGFileName (pathToFile) {
  return pathToFile.match(/[a-zA-Z0-9 _-]+\.png$/)[0];
}

/**
 * generic error handling: if passed an error, throws the error
 */
function handleGeneralError (error) {
  if (error) {
    throw error;
  }
}

/**
 * saves the diff image of the two specified image files
 */
function saveDiffImage (baselineImagePath, latestImagePath, diffDirectory, callback) {
  var diffSaveOptions = {
        'file': diffDirectory + '/' + extractPNGFileName(latestImagePath),
        'highlightColor': 'fuchsia'
      };

  gm.compare(baselineImagePath, latestImagePath, diffSaveOptions, function (error) {
    handleGeneralError(error);
    callback();
  });
}

function assertImagesAreEqual (baselineImagePath, latestImagePath, options, callback) {
  var diffTolerance = options.diffTolerance || 0.01 / 100,
      diffDirectory = options.diffDirectory || 'diffs';

  // compare the screens
  gm.compare(baselineImagePath, latestImagePath, diffTolerance, function (error, imagesAreEqual, imageDiffAmount) {
    handleGeneralError(error);

    if (!imagesAreEqual) {
      saveDiffImage(baselineImagePath, latestImagePath, diffDirectory, function () {
        throw new Error('baseline screenshot is ' + Math.round(imageDiffAmount * 100 * 100) / 100  + '% different from latest screenshot');
      });
    } else {
      callback();
    }
  });
}

module.exports = assertImagesAreEqual;