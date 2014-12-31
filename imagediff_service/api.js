var Promise = require('bluebird');
var uuid = require('node-uuid');


var ImageDiffServiceApi = function(imageDir) {
  this._imageDir = imageDir;
};


// Returns promise of image ID stored in storage service.
ImageDiffServiceApi.prototype.getDiffImage = function(
  fromImageId,
  toImageId
) {
  var uniqueId = uuid.v4();
  return [uniqueId, 50];
};


module.exports = ImageDiffServiceApi;
