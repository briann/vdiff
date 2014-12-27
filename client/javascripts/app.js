'use strict';


angular.module('vdiff', [
  'ngRoute',
  'vdiff.ExecutionView',
  'vdiff.PlanView'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/plans'});
}]);
