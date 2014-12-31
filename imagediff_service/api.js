var Promise = require('bluebird');
var uuid = require('node-uuid');


var ImageDiffServiceApi = function(storageService) {
  this._storageService = storageService;
};


// Returns promise of image ID stored in storage service.
ImageDiffServiceApi.prototype.getDiffImage = function(
  fromImageId,
  toImageId
) {
  return [this._storageService.storeImage(null), 50];
};


module.exports = ImageDiffServiceApi;
