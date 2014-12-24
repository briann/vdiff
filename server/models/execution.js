var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Execution = sequelize.define('Execution', {
    fromKey: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: true
      }
    },
    fromUrl: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    toKey: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: true
      }
    },
    toUrl: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
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
