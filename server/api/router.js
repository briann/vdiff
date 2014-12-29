var Promise = require('bluebird');
var assert = require('assert');
var express = require('express');
var models = require('../models');
var validator = require('validator');
var error = require('./errors');
var PlansApi = require('./plans_api');


var ApiRouter = function(plansApi) {
  this._plansApi = plansApi;
};


ApiRouter.prototype._handleNewExecution = function(req, res) {
  var plan = req.body.plan;
  var fromUrl = req.body.fromUrl;
  var fromKey = req.body.fromKey;
  var toUrl = req.body.toUrl;
  var toKey = req.body.toKey;

  assert(plan, 'Request should provide a diff plan.');
  assert(validator.matches(fromKey, /^[-_a-zA-Z0-9]+$/i));
  assert(validator.matches(toKey, /^[-_a-zA-Z0-9]+$/i));
  assert(validator.isURL(fromUrl));
  assert(validator.isURL(toUrl));

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


ApiRouter.prototype._handleDeletePlan = function(req, res) {
  var id = req.params.planId;
  assert(id);
  this._plansApi.deletePlan(id).then(function() {
    res.json(true);
  }).catch(function(error) {
    res.json(false);
  });
};


ApiRouter.prototype._handleNewOrUpdatedPlan = function(req, res) {
  var id = req.body.id;
  var key = req.body.key;
  var description = req.body.description;
  var defaultTimeoutMs = req.body.defaultTimeoutMs;
  var inputSteps = req.body.Steps;

  assert(key || id);
  assert(defaultTimeoutMs > 0);
  assert(inputSteps);
  assert(validator.matches(key, /^[-_a-zA-Z0-9]+$/));

  var steps = [];
  for (var i = 0; i < inputSteps.length; i++) {
    var inputStep = inputSteps[i];
    assert(inputStep.path);
    // Should assert an agent once we start accepting agents.
    var step = { path: inputStep.path };
    if (inputStep.timeoutMs) {
      step.timeoutMs = inputStep.timeoutMs;
    }
    steps.push(step);
  }

  return this._plansApi.createOrUpdatePlan(
    id,
    key,
    defaultTimeoutMs,
    steps,
    description
  ).bind({ _plansApi: this._plansApi }).then(function(planId) {
    return this._plansApi.getPlanJson(planId);
  }).then(function(planJson) {
    res.json(planJson);
  });
};


ApiRouter.prototype._handleGetPlan = function(req, res) {
  var id = req.params.planId;
  assert(id);
  this._plansApi.getPlanJson(id).then(function(planJson) {
    res.json(planJson);
  }).catch(function(error) {
    console.log(error);
    res.json(null);
  });
};


ApiRouter.prototype._handleListPlans = function(req, res) {
  this._plansApi.getPlanListJson().then(function(planListJson) {
    res.json(planListJson);
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


// ApiRouter.prototype._handleGetStepsForPlan = function(req, res) {
//   var key = req.query.key;
//   assert(key);
//
//   models.Plan.find({where: { key: key }}).then(function(plan) {
//     if (!plan) {
//       throw new PlanNotFoundError();
//     } else {
//       return plan.getSteps();
//     }
//   }).reduce(function(accumulator, step) {
//     accumulator.push(step);
//     return accumulator;
//   }, []).then(function(steps) {
//     res.json(steps);
//   }).catch(PlanNotFoundError, function(error) {
//     res.status(500).send();
//   });
// };


ApiRouter.prototype.getRouter = function() {
  var router = express.Router();

  // Agents
  router.get('/agents', this._handleListAgents.bind(this));

  // Plans
  router.get('/plans', this._handleListPlans.bind(this));
  router.get('/plans/:planId', this._handleGetPlan.bind(this));
  router.post('/plans', this._handleNewOrUpdatedPlan.bind(this));
  router.delete('/plans/:planId', this._handleDeletePlan.bind(this));

  // Steps
  // router.get('/steps', this._handleGetStepsForPlan);

  // Executions
  router.post('/executions', this._handleNewExecution.bind(this));
  router.get('/executions', this._handleListExecutions.bind(this));
  router.get('/executions/:executionId', this._handleGetExecution.bind(this));

  // Diffs

  return router;
};


module.exports = ApiRouter;
