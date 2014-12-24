var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Diff = sequelize.define('Diff', {
    fromImageId: { type: Sequelize.STRING },
    toImageId:   { type: Sequelize.STRING },
    compImageId: { type: Sequelize.STRING },
    compPercent: { type: Sequelize.INTEGER }
  }, {
    classMethods: {
      associate: function(models) {
        Diff.belongsTo(models.Execution);
        Diff.belongsTo(models.Step);
      }
    }
  });

  return Diff;
};
