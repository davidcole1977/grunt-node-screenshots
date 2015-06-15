var gm = require('gm');

function isolatePNGFileName (pathToFile) {
  return pathToFile.match(/[a-zA-Z0-9 _-]+\.png$/)[0];
}

function handleGeneralError (error) {
  if (error) {
    throw error;
  }
}

function saveDiffImage (baselineImagePath, latestImagePath, callback) {
  var diffSaveOptions = {
        'file': 'reporting/screenshots/diffs/' + isolatePNGFileName(baselineImagePath),
        'highlightColor': 'fuchsia'
      };

  gm.compare(baselineImagePath, latestImagePath, diffSaveOptions, function (error) {
    handleGeneralError(error);
    callback();
  });
}

function assertImagesAreEqual (baselineImagePath, latestImagePath, callback) {
  var diffTolerance = 0.01 / 100;

  // compare the screens
  gm.compare(baselineImagePath, latestImagePath, diffTolerance, function (error, imagesAreEqual, imageDiffAmount) {
    handleGeneralError(error);

    if (!imagesAreEqual) {
      saveDiffImage(baselineImagePath, latestImagePath, function () {
        throw new Error('baseline screenshot is ' + Math.round(imageDiffAmount * 100 * 100) / 100  + '% different from latest screenshot');
      });
    } else {
      callback();
    }
  });
}

module.exports = assertImagesAreEqual;