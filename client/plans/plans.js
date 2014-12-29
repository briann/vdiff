'use strict';

var plan = angular.module('vdiff.PlanView', ['ngRoute', 'angularMoment', 'ui.bootstrap']);

plan.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/plans', {
    templateUrl: 'plans/plan_list.html',
    controller: 'PlanListCtrl'
  });
  $routeProvider.when('/plans/:planId', {
    templateUrl: 'plans/plan.html',
    controller: 'PlanCtrl'
  });
}]);

plan.controller('PlanListCtrl', function($scope, $http, Plan, $location) {
  Plan.query(function(data) {
    $scope.plans = data;
  });

  $scope.createPlan = function() {
    // Plan.
    var plan = new Plan({
      key: 'RENAME_ME_' + Math.floor((new Date().getTime() / 1000)),
      defaultTimeoutMs: 10000,
      Steps: []
    });
    plan.$save(function(savedPlan) {
      $scope.plans.push(savedPlan);
      $location.path('/plans/' + savedPlan.id);
    });
  };

  $scope.deletePlan = function(planId, index) {
    // console.log(planId);
    Plan.delete({ id: planId });
    $scope.plans.splice(index, 1);
  };
});

plan.controller('PlanCtrl', function($scope, $http, $routeParams, $location, Plan) {
  if ($routeParams.planId == null) {
    $location.path('/plans');
  }

  $scope.params = $routeParams;
  $scope.alerts = [];

  Plan.get({ id: $routeParams.planId }, function(data) {
    $scope.plan = data;
  });

  $scope.isLegalKey = function(key) {
    return false;
  };

  $scope.addAlert = function(type, message) {
    $scope.alerts.push({type: type, msg: message, time: new Date()});
  };

  $scope.addSuccessAlert = function(message) {
    $scope.addAlert('success', message);
  };

  $scope.addDangerAlert = function(message) {
    $scope.addAlert('danger', message);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.clearAlerts = function() {
    $scope.alerts = [];
  };

  $scope.submit = function(isValid, plan) {
    if (!isValid) {
      $scope.clearAlerts();
      $scope.addDangerAlert('Invalid plan input fields.');
      return;
    }

    window.scrollTo(0,0);
    plan.$save(function(){
      $scope.clearAlerts();
      $scope.addSuccessAlert('Successfully updated plan!');
    }, function() {
      $scope.clearAlerts();
      $scope.addDangerAlert('Something bad happened while updating the plan.');
    });
  };

  $scope.addStep = function() {
    $scope.plan.Steps.push({
      'path': '',
      'timeoutMs': null,
      'Agent': {
        'key': 'default'
      }
    });
  };

  $scope.removeStep = function(index) {
    $scope.plan.Steps.splice(index, 1);
  };
});
