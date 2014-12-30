var Promise = require('bluebird');
var uuid = require('node-uuid');


var ImageDiffServiceApi = function(storageService) {
};


// Returns promise of image ID stored in storage service.
ImageDiffServiceApi.prototype.getDiffImage = function(
  fromImageId,
  toImageId
) {
  return Promise.resolve([uuid.v4(), 50]);
};


module.exports = ImageDiffServiceApi;
