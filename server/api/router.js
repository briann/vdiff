var Promise = require('bluebird');
var assert = require('assert');
var express = require('express');
var models = require('../models');
var validator = require('validator');
var PlanNotFoundError = require('./plan_not_found_error');
var PlansApi = require('./plans_api');
var ExecutionsApi = require('./executions_api');


var ApiRouter = function(plansApi, executionsApi) {
  this._plansApi = plansApi;
  this._executionsApi = executionsApi;
};


ApiRouter.prototype._handleNewExecution = function(req, res) {
  var planId = req.body.planId;
  var fromUrl = req.body.fromUrl;
  var fromKey = req.body.fromKey;
  var toUrl = req.body.toUrl;
  var toKey = req.body.toKey;

  assert(planId);
  assert(validator.matches(fromKey, /^[-_a-zA-Z0-9]+$/i));
  assert(validator.matches(toKey, /^[-_a-zA-Z0-9]+$/i));
  var urlValidatorOptions = {
    require_tld: false,
    require_protocol: true,
    allow_underscores: true
  };
  assert(validator.isURL(fromUrl, urlValidatorOptions));
  assert(validator.isURL(toUrl, urlValidatorOptions));

  // Set up execution.
  this._executionsApi.createExecution(
    fromKey,
    fromUrl,
    toKey,
    toUrl,
    planId
  ).then(function(executionJson) {
    res.json(executionJson);
  }).catch(PlanNotFoundError, function(error) {
    res.status(500).send();
  });
};


ApiRouter.prototype._handleListExecutions = function(req, res) {
  this._executionsApi.getExecutionListJson().then(function(items) {
    res.json(items);
  });
};


ApiRouter.prototype._handleGetExecution = function(req, res) {
  var id = req.params.executionId;
  assert(id);
  this._executionsApi.getExecutionJson(id).then(function(executionJson) {
    res.json(executionJson);
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
