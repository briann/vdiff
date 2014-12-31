var Promise = require('bluebird');
var uuid = require('node-uuid');


var ScreenshotServiceApi = function(storageService) {
  this._storageService = storageService;
};


// Returns promise of image ID stored in storage service.
ScreenshotServiceApi.prototype.getScreenshot = function(
  url,
  timeoutMs,
  userAgent,
  width
) {
  return this._storageService.storeImage(null);
};


module.exports = ScreenshotServiceApi;
