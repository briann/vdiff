var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Agent = sequelize.define('Agent', {
    key:       {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUppercase: true
      }
    },
    userAgent: { type: Sequelize.STRING, allowNull: false },
    width:     { type: Sequelize.INTEGER, allowNull: false }
  }, {
    classMethods: {
      associate: function(models) {
        Agent.hasMany(models.Step);
      }
    }
  });

  return Agent;
};
