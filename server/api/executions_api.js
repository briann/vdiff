var Promise = require('bluebird');
var models = require('../models');
var error = require('./plan_not_found_error');
var _ = require('underscore');


var ExecutionsApi = function(screenshotService, imageDiffService) {
  this._screenshotService = screenshotService;
  this._imageDiffService = imageDiffService;
};


ExecutionsApi.prototype.createExecution = function(fromKey, fromUrl, toKey,
    toUrl, planId) {
  return Promise.bind({
    getExecutionJson: this.getExecutionJson,
    submitExecutionToScreenshotService:
      _.bind(this._submitExecutionToScreenshotService, this)
  }).then(function() {
    return models.Plan.find(planId);
  }).then(function(plan) {
    if (!plan) {
      throw new PlanNotFoundError();
    } else {
      this.plan = plan;
      return models.Execution.create({
        fromKey: fromKey,
        fromUrl: fromUrl,
        toKey: toKey,
        toUrl: toUrl
      });
    }
  }).then(function(execution) {
    this.execution = execution;
    return execution.setPlan(this.plan);
  }).then(function(success) {
    return this.plan.getSteps();
  }).map(function(step) {
    return models.Diff.create({}).bind({
      execution: this.execution
    }).then(function(diff) {
      diff.setStep(step);
      diff.setExecution(this.execution);
      return diff;
    });
  }).then(function(diffs) {
    return this.getExecutionJson(this.execution.id);
  }).then(function(executionJson) {
    this.submitExecutionToScreenshotService(executionJson);
    return executionJson;
  });
};


ExecutionsApi.prototype._submitExecutionToScreenshotService =
    function(executionJson) {
  // should refactor / unroll this.
  Promise.bind({
    executionJson: executionJson,
    screenshotService: this._screenshotService,
    imageDiffService: this._imageDiffService
  }).then(function() {
    var diffsToCapture = [];
    var fromBaseUrl = this.executionJson.fromUrl;
    var toBaseUrl = this.executionJson.toUrl;
    for (var i = 0; i < this.executionJson.Diffs.length; i++) {
      var diff = this.executionJson.Diffs[i];
      var agent = diff.Step.Agent;
      var diffToUpdate = diff.id;
      var userAgent = agent.userAgent;
      var width = agent.width;
      // Derp, timeout is actually a delay. I should update the naming everywhere.
      var timeoutMs = diff.Step.timeoutMs || this.executionJson.Plan.defaultTimeoutMs;

      var fromUrl = fromBaseUrl + diff.Step.path;
      var toUrl = toBaseUrl + diff.Step.path;

      diffsToCapture.push({
        userAgent: userAgent,
        width: width,
        timeoutMs: timeoutMs,
        diffToUpdate: diffToUpdate,
        fromUrl: fromUrl,
        toUrl: toUrl
      });
    }
    return diffsToCapture;
  }).map(function(diffToCapture) {
    return this.screenshotService.getScreenshot(
      diffToCapture.fromUrl,
      diffToCapture.timeoutMs,
      diffToCapture.userAgent,
      diffToCapture.width
    ).bind({
      screenshotService: this.screenshotService,
      imageDiffService: this.imageDiffService
    }).then(function(fromScreenshotId) {
      this.fromScreenshotId = fromScreenshotId;
      return this.screenshotService.getScreenshot(
        diffToCapture.toUrl,
        diffToCapture.timeoutMs,
        diffToCapture.userAgent,
        diffToCapture.width);
    }).then(function(toScreenshotId) {
      this.toScreenshotId = toScreenshotId;
      return this.imageDiffService.getDiffImage(this.fromScreenshotId, this.toScreenshotId);
    }).spread(function(diffScreenshotId, diffPercentage) {
      this.diffScreenshotId = diffScreenshotId;
      this.diffPercentage = diffPercentage;
      return models.Diff.find(diffToCapture.diffToUpdate);
    }).then(function(diff) {
      if (this.fromScreenshotId &&
          this.toScreenshotId &&
          this.diffScreenshotId) {
        diff.fromImageId = this.fromScreenshotId;
        diff.toImageId = this.toScreenshotId;
        diff.compImageId = this.diffScreenshotId;
        diff.compPercent = this.diffPercentage;
      }
      return diff.save();
    });
  });
};


ExecutionsApi.prototype.getExecutionListJson = function() {
  return models.Execution.findAll({
    order: [['updatedAt', 'DESC']],
    include: [
      {
        model: models.Plan
      },
      {
        model: models.Diff,
        include: [models.Step]
      }
    ]
  }).reduce(function(accumulator, item) {
    var executionJson = item.toJSON();
    var pendingDiffs = 0;
    for (var i = 0; i < executionJson.Diffs.length; i++) {
      if (!executionJson.Diffs[i].compImageId) {
        pendingDiffs++;
      }
    }
    executionJson.pendingDiffs = pendingDiffs;
    executionJson.completedDiffs = executionJson.Diffs.length - pendingDiffs;
    accumulator.push(executionJson);
    return accumulator;
  }, []);
};


ExecutionsApi.prototype.getExecutionJson = function(id) {
  return models.Execution.find({
    where: { id: id },
    include: [
      {
        model: models.Plan
      },
      {
        model: models.Diff,
        include: [{
          model: models.Step,
          include: [models.Agent]
        }]
      }
    ]
  }).then(function(execution) {
    var executionJson = execution.toJSON();
    var pendingDiffs = 0;
    for (var i = 0; i < executionJson.Diffs.length; i++) {
      if (!executionJson.Diffs[i].compImageId) {
        pendingDiffs++;
      }
    }
    executionJson.pendingDiffs = pendingDiffs;
    executionJson.completedDiffs = executionJson.Diffs.length - pendingDiffs;
    return executionJson;
  });
};


module.exports = ExecutionsApi;
