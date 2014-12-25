var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Plan = sequelize.define('Plan', {
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    title:            { type: Sequelize.STRING, allowNull: false },
    description:      { type: Sequelize.TEXT },
    defaultTimeoutMs: { type: Sequelize.INTEGER }
  }, {
    classMethods: {
      associate: function(models) {
        Plan.hasMany(models.Step);
        Plan.hasMany(models.Execution);
      }
    }
  });

  return Plan;
};
