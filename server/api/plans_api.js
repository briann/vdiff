var Promise = require('bluebird');
var models = require('../models');
var error = require('./errors');


var PlansApi = function() {};


PlansApi.prototype.deletePlan = function(id) {
  return models.Plan.find(id).then(function(plan) {
    return plan.destroy();
  });
};


PlansApi.prototype.createOrUpdatePlan = function(id, key,
    defaultTimeoutMs, inputSteps, opt_description) {

  var planAttributes = {
    key: key,
    description: opt_description || '',
    defaultTimeoutMs: defaultTimeoutMs
  };

  var planPromise = null;
  if (id) {
    planPromise = models.Plan.findOne(id).then(function(plan) {
      return plan.updateAttributes(planAttributes);
    });
  } else {
    planPromise = models.Plan.create(planAttributes);
  }

  return planPromise.then(function(plan) {
    this.plan = plan;
    return Promise.map(inputSteps, function(inputStep) {
      return models.Step.create(inputStep).bind({
        inputStep: inputStep
      }).then(function(step) {
        this.step = step;
        return models.Agent.findOne({
          where: {
            key: 'DESKTOP_CHROME'
          }
        });
      }).then(function(agent) {
        return this.step.setAgent(agent);
      }).then(function(success) {
        return this.step;
      });
    });
  }).then(function(steps) {
    this.steps = steps;
    return this.plan.setSteps(this.steps);
  }).then(function(success) {
    return this.plan.id;
  });
};


// Returns Promise of JSON blob of a plan.
PlansApi.prototype.getPlanJson = function(id) {
  return models.Plan.find({
    where: {
      id: id
    },
    include: [{
      model: models.Execution
    }, {
      model: models.Step,
      include: [models.Agent]
    }]
  }).then(function(plan) {
    return plan.toJSON();
  });
};


// Returns a Promise of an Array of Plan JSON blobs.
PlansApi.prototype.getPlanListJson = function() {
  return models.Plan.findAll().map(function(plan) {
    // Get execution details for each plan (execution counts and last executed).
    return models.Execution.count({
      where: {
        PlanId: plan.id
      }
    }).bind({
      plan: plan
    }).then(function(count) {
      this.count = count;
      // Search for the last exeuction.
      return models.Execution.findOne({
        where: {
          PlanId: plan.id
        },
        order: [
          ['updatedAt', 'DESC']
        ]
      });
    }).then(function(lastExecution) {
      var planJson = this.plan.toJSON();
      planJson.executionCount = this.count;
      planJson.lastExecution = lastExecution ? lastExecution.toJSON() : null;
      return planJson;
    });
  }).reduce(function(accumulator, json) {
    accumulator.push(json);
    return accumulator;
  }, []);
};


module.exports = PlansApi;
