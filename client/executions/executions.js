'use strict';

var executionView = angular.module('vdiff.ExecutionView', ['ngRoute']);

executionView.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/executions', {
    templateUrl: 'executions/execution_list.html',
    controller: 'ExecutionListCtrl'
  });
  $routeProvider.when('/executions/:executionId', {
    templateUrl: 'executions/execution.html',
    controller: 'ExecutionCtrl'
  });
}]);

executionView.controller('ExecutionListCtrl', function($scope, Execution, Plan) {
  $scope.showExecutionCreationForm = false;

  // Don't need to do this, I just like being explicit.
  $scope.newExecution = {
    fromKey: null,
    fromUrl: null,
    toKey: null,
    toUrl: null
  };

  $scope.submit = function(isValid, newExecution) {
    if (!isValid) {
      return;
    }

    newExecution.planId = newExecution.plan.id;
    delete newExecution.plan;

    var execution = new Execution(newExecution);
    execution.$save(function(savedExecution) {
      $scope.executions.push(savedExecution);
    });
  };

  Execution.query(function(data) {
    $scope.executions = data;
  });

  Plan.query(function(data) {
    $scope.plans = data;
  });
});

executionView.controller('ExecutionCtrl', function($scope, $routeParams, $location, Execution) {
  if ($routeParams.executionId == null) {
    $location.path('/executions');
  }

  $scope.params = $routeParams;

  Execution.get({ id: $routeParams.executionId }, function(data) {
    $scope.execution = data;

    if (_.some(data.Diffs), function(diff) { return diff.compImageId == null }) {
      $scope.executionStatus = {
        labelClass: 'label-warning',
        message: 'PENDING'
      };
    } else {
      $scope.executionStatus = {
        labelClass: 'label-success',
        message: 'DONE'
      };
    }
  });
});
