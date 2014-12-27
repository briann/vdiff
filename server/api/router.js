var Promise = require('bluebird');
var assert = require('assert');
var express = require('express');
var models = require('../models');
var validator = require('validator');


// TODO:
// - split this file out?
// - do i have enough to write up a UI?
//  UI: plans first (which also define steps), then execution submission and viewing.

var PlanNotFoundError = function() {};
PlanNotFoundError.prototype = Object.create(Error.prototype);


var ApiRouter = function() {
};


ApiRouter.prototype._handleNewExecution = function(req, res) {
  var plan = req.body.plan;
  var fromUrl = req.body.fromUrl;
  var fromKey = req.body.fromKey;
  var toUrl = req.body.toUrl;
  var toKey = req.body.toKey;

  assert(plan, 'Request should provide a diff plan.');
  validator.isAlphanumeric(fromKey);
  validator.isAlphanumeric(toKey);
  validator.isURL(fromUrl);
  validator.isURL(toUrl);

  // Set up execution.
  Promise.bind({}).then(function() {
    return models.Plan.find(plan);
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
    res.json(this.execution.toJSON());
  }).catch(PlanNotFoundError, function(error) {
    res.status(500).send();
  });
};


ApiRouter.prototype._handleListExecutions = function(req, res) {
  models.Execution.findAll({
    order: [['updatedAt', 'DESC']]
  }).reduce(function(accumulator, item) {
    accumulator.push(item);
    return accumulator;
  }, []).then(function(items) {
    res.json(items);
  });
};


ApiRouter.prototype._handleGetExecution = function(req, res) {
  var id = req.params.executionId;
  assert(id);
  models.Execution.find({
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
    res.json(execution.toJSON());
  });
};


ApiRouter.prototype._handleNewOrUpdatedPlan = function(req, res) {
  var key = req.body.key;
  var title = req.body.title;
  var description = req.body.description;
  var defaultTimeoutMs = req.body.defaultTimeoutMs;
  var inputSteps = req.body.steps;

  assert(key);
  assert(title);
  assert(defaultTimeoutMs > 0);
  assert(inputSteps);

  var steps = [];
  for (var i = 0; i < inputSteps.length; i++) {
    var inputStep = inputSteps[i];
    assert(inputStep.path);
    var step = { path: inputStep.path };
    // use a library function here
    if (inputStep.timeoutMs) {
      step.timeoutMs = inputStep.timeoutMs;
    }
    steps.push(step);
  }

  var planAttributes = {
    key: key,
    title: title,
    description: description || '',
    defaultTimeoutMs: defaultTimeoutMs
  };

  models.Plan.findOne({
    where: { key: key }
  }).bind({}).then(function(plan) {
    if (!!plan) {
      return plan.updateAttributes(planAttributes);
    } else {
      return models.Plan.create(planAttributes);
    }
  }).then(function(plan) {
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
  }).then(function() {
    res.json(this.plan.toJSON());
  });
};


ApiRouter.prototype._handleGetPlan = function(req, res) {
  var id = req.params.planId;
  assert(id);
  models.Plan.find({
    where: { id: id },
    include: [
      {
        model: models.Execution
      },
      {
        model: models.Step,
        include: [models.Agent]
      }
    ]
  }).then(function(plan) {
    res.json(plan.toJSON());
  }).catch(function(error) {
    res.json(null);
  });
};


ApiRouter.prototype._handleListPlans = function(req, res) {
  models.Plan.findAll().map(function(plan) {
    // Get execution details for each plan (execution counts and last executed).
    return models.Execution.count({
      where: { PlanId: plan.id }
    }).bind({
      plan: plan
    }).then(function(count) {
      this.count = count;
      // Search for the last exeuction.
      return models.Execution.findOne({
        where: { PlanId: plan.id },
        order: [['updatedAt', 'DESC']]
      });
    }).then(function(lastExecution) {
      var planJson = this.plan.toJSON();
      planJson.executionCount = this.count;
      planJson.lastExecution = lastExecution ? lastExecution.toJSON() : null;
      return planJson;
    });
  }).reduce(function(accumulator, json) {
    accumulator[json.key] = json;
    return accumulator;
  }, {}).then(function(plansJsonWithCount) {
    res.json(plansJsonWithCount);
  });
};


ApiRouter.prototype._handleListAgents = function(req, res) {
  models.Agent.findAll().reduce(function(accumulator, item) {
    accumulator[item.key] = item;
    return accumulator;
  }, {}).then(function(items) {
    res.json(items);
  });
};


ApiRouter.prototype._handleGetStepsForPlan = function(req, res) {
  var key = req.query.key;
  assert(key);

  models.Plan.find({where: { key: key }}).then(function(plan) {
    if (!plan) {
      throw new PlanNotFoundError();
    } else {
      return plan.getSteps();
    }
  }).reduce(function(accumulator, step) {
    accumulator.push(step);
    return accumulator;
  }, []).then(function(steps) {
    res.json(steps);
  }).catch(PlanNotFoundError, function(error) {
    res.status(500).send();
  });
};


ApiRouter.prototype.getRouter = function() {
  var router = express.Router();

  // Agents
  router.get('/agents', this._handleListAgents);

  // Plans
  router.get('/plans', this._handleListPlans);
  router.get('/plans/:planId', this._handleGetPlan);
  router.post('/plans', this._handleNewOrUpdatedPlan);

  // Steps
  router.get('/steps', this._handleGetStepsForPlan);

  // Executions
  router.post('/executions', this._handleNewExecution);
  router.get('/executions', this._handleListExecutions);
  router.get('/executions/:executionId', this._handleGetExecution);

  // Diffs

  return router;
};


module.exports = ApiRouter;
