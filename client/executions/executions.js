'use strict';

angular.module('vdiff.ExecutionView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/executions', {
    templateUrl: 'executions/executions.html',
    controller: 'ExecutionCtrl'
  });
}])

.controller('ExecutionCtrl', [function() {

}]);
