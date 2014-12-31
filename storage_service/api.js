var Promise = require('bluebird');
var uuid = require('node-uuid');


var StorageServiceApi = function() {
};


// Returns promise of image ID stored in storage service.
StorageServiceApi.prototype.storeImage = function(data) {
  console.log('Using storage service...');
  return Promise.resolve(uuid.v4());
};


module.exports = StorageServiceApi;
