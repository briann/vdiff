var express = require('express');
var assert = require('assert');


var ApiRouter = function() {

};


ApiRouter.prototype._handleNewDiff = function(req, res) {
  var plan = req.body.plan;
  var fromUrl = req.body.fromUrl;
  var toUrl = req.body.toUrl;

  assert(plan, "Request should provide a diff plan.");
  assert(fromUrl, "Request should provide a from-URL.");
  assert(toUrl, "Request should provide a to-URL.");


  // Write it out
  // Retrieve plan.
  // For each of the plan's paths, create a screenshon for both from/to base URL
  // Save them and diff it, create a diff image (save that too).


  res.json({
    "status": "success"
  });
};


ApiRouter.prototype.getRouter = function() {
  var router = express.Router();
  router.post('/diffs', this._handleNewDiff);
  return router;
};


module.exports = ApiRouter;
