'use strict';


var app = angular.module('vdiff', [
  'ngRoute',
  'vdiff.ExecutionView',
  'vdiff.PlanView',
  'ngResource',
  'ui.bootstrap'
]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/plans'});
}]);

app.factory('Plan', function($resource) {
  var url = '/api/plans/:id';
  var paramDefaults = {};
  var actions = {

    'save': {
      method: 'POST',
      transformRequest: function(planRequest, headersGetter) {
        // copy
        var plan = JSON.parse(JSON.stringify(planRequest));

        if (plan.Steps) {
          for (var s = 0; s < plan.Steps.length; s++) {
            delete plan.Steps[s].id;
          }
        }

        return angular.toJson(plan);
      }
    }
  };
  return $resource(url, paramDefaults, actions);
});
