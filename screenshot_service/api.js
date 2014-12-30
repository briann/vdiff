var Promise = require('bluebird');
var uuid = require('node-uuid');


var ScreenshotServiceApi = function() {
};


// Returns promise of image ID stored in storage service.
ScreenshotServiceApi.prototype.getScreenshot = function(
  url,
  timeoutMs,
  userAgent,
  width
) {
  return Promise.resolve(uuid.v4());
};


module.exports = ScreenshotServiceApi;
