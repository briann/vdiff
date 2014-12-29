
var PlanNotFoundError = function() {};
PlanNotFoundError.prototype = Object.create(Error.prototype);

module.exports = PlanNotFoundError;
