var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Execution = sequelize.define('Execution', {
    fromKey: {
      type: Sequelize.STRING,
      allowNull: false
    },
    fromUrl: {
      type: Sequelize.STRING,
      allowNull: false
    },
    toKey: {
      type: Sequelize.STRING,
      allowNull: false
    },
    toUrl: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Execution.belongsTo(models.Plan);
        Execution.hasMany(models.Diff);
      }
    }
  });

  return Execution;
};
