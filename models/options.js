"use strict";
const { Model, where } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      options.belongsTo(models.questions, {
        foreignKey: "QuestionId",
      });
    }

    static async FindOptionsTOQuestions(qid) {
      return this.findAll({
        where: {
          QuestionId: qid,
        },
      });
    }
    static async Deleteoptions(qid) {
      return this.destroy({
        where: {
          QuestionId: qid,
        },
      });
    }
  }
  options.init(
    {
      optionname: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "options",
    }
  );
  return options;
};
