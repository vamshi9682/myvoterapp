"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      voter.belongsTo(models.elections, {
        foreignKey: "ElectionId",
      });
    }
  }
  voter.init(
    {
      VoterId: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "voter",
    }
  );
  return voter;
};
