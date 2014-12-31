var Promise = require('bluebird');
var uuid = require('node-uuid');
var qs = require('querystring');
var fs = require('fs');
var r = require('request');


var ScreenshotServiceApi = function(imageDir, manetRestApi) {
  this._imageDir = imageDir;
  this._manetRestApi = manetRestApi;
};


// Returns promise of image ID stored in storage service.
ScreenshotServiceApi.prototype.getScreenshot = function(
  urlToScreenshot,
  timeoutMs,
  userAgent,
  width
) {
  var manetQuery = qs.stringify({
    url: urlToScreenshot,
    delay: timeoutMs,
    width: width,
    format: 'png'
  });
  var manetUrl = this._manetRestApi + manetQuery;
  var uniqueId = uuid.v4();
  var filePath = this._imageDir + '/' + uniqueId + '.png';

  r.get(manetUrl).pipe(fs.createWriteStream(filePath));

  return Promise.resolve(uniqueId);
};


module.exports = ScreenshotServiceApi;
