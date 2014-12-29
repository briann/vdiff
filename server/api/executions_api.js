var Promise = require('bluebird');
var models = require('../models');
var error = require('./plan_not_found_error');


var ExecutionsApi = function() {};


ExecutionsApi.prototype.createExecution = function(fromKey, fromUrl, toKey,
    toUrl, planId) {
  return Promise.bind({
    getExecutionJson: this.getExecutionJson
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
    console.log('Should send execution #' + this.execution.id + ' to be run.');
    return this.getExecutionJson(this.execution.id);
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
        include: [models.Step]
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
