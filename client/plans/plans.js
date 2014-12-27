'use strict';

var plan = angular.module('vdiff.PlanView', ['ngRoute', 'angularMoment']);

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

plan.controller('PlanListCtrl', function($scope, $http) {
  $http.get('/api/plans').then(function(response) {
    $scope.plans = response.data;
  });
});

plan.controller('PlanCtrl', function($scope, $http, $routeParams, $location) {
  if ($routeParams.planId == null) {
    $location.path('/');
  }
  $scope.params = $routeParams;
  $http.get('/api/plans/' + $routeParams.planId).then(function(response) {
    $scope.plan = response.data;
  });
});


plan.controller('PlanFormCtrl', function($scope, $http) {
  // pull this out.
  this.submit = function(isValid, plan) {
    if (!isValid) {
      console.log('INVALID');
      return;
    }

// todos
    // use ngResource?
    // maybe rename some things in the plan/:id response to be lower case?
    // maybe don't do eager loading in plan/:id call?

    console.log(plan);
  };

  $scope.addStep = function() {
    // console.log(plan);
  };
});
