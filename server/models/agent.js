var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Agent = sequelize.define('Agent', {
    userAgent: { type: Sequelize.STRING, allowNull: false },
    width:     { type: Sequelize.INTEGER, allowNull: false },
    height:    { type: Sequelize.INTEGER, allowNull: false }
  }, {
    classMethods: {
      associate: function(models) {
        // Associate with steps or plans?
      }
    }
  });

  return Agent;
};
