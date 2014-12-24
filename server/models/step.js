var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Step = sequelize.define('Step', {
    path:      { type: Sequelize.STRING, allowNull: false },
    timeoutMs: { type: Sequelize.INTEGER }
  }, {
    classMethods: {
      associate: function(models) {
        Step.belongsTo(models.Plan);
        Step.hasOne(models.Agent);
        Step.hasMany(models.Diff);
      }
    }
  });

  return Step;
};
