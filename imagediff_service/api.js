var Promise = require('bluebird');
var uuid = require('node-uuid');
var imagediff = require('imagediff');
var Canvas = require('canvas');
var fs = require("fs");
Promise.promisifyAll(fs);


var ImageDiffServiceApi = function(imageDir) {
  this._imageDir = imageDir;
};


ImageDiffServiceApi.prototype._loadImage = function(url, callback) {
  var image = new Canvas.Image();
  fs.readFile(url, function (error, data) {
    if (error) throw error;
    image.onload = function () {
      callback(image);
    };
    image.onerror = function () {
      throw 'Error loading image buffer.'
    };
    image.src = data;
  });
  return image;
};


// Returns promise of image ID stored in storage service.
ImageDiffServiceApi.prototype.getDiffImage = function(
  fromImageId,
  toImageId
) {
  var fromFilePath = this._imageDir + '/' + fromImageId + '.png';
  var toFilePath = this._imageDir + '/' + toImageId + '.png';
  var diffImageId = uuid.v4();
  var diffFilePath = this._imageDir + '/' + diffImageId + '.png';

  var fromCanvasImage = new Canvas.Image();
  fs.readFile(fromFilePath, function(error, data) {
    console.log(fromFilePath);
    fromCanvasImage.src = data;
  });

  return fs.readFileAsync(fromFilePath).bind({
    fromFilePath: fromFilePath,
    toFilePath: toFilePath,
    diffFilePath: diffFilePath,
    diffImageId: diffImageId
  }).then(function(fromFileData) {
    // console.log(fromFileData);
    // var fromCanvasImage = new Canvas.Image();
    // fromCanvasImage.src = fromFileData;
    // this.fromCanvasImage = fromCanvasImage;
    return fs.readFileAsync(this.toFilePath);
  }).then(function(toFileData) {
    // var toCanvasImage = new Canvas.Image();
    // toCanvasImage.src = toFileData;
    // this.toCanvasImage = toCanvasImage;
    return Promise.resolve([this.diffImageId, 50]);
  });

  // this._loadImage(toFilePath, function(toFileData) {
  //   this._loadImage(fromFilePath, function(fromFileData) {
      // var toImage = imagediff.toImageData(toFileData);
      // var fromImage = imagediff.toImageData(fromFileData);
      // var diffImage = imagediff.diff(fromImage, toImage, {});
      // imagediff.imageDataToPNG(diffImage, diffFilePath, function() {
      //   console.log('Diff output png: ' + diffFilePath);
      // });
  //   });
  // });
};


module.exports = ImageDiffServiceApi;
