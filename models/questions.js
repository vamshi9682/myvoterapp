"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      questions.belongsTo(models.elections, {
        foreignKey: "ElectionId",
      });
      questions.hasMany(models.options, {
        foreignKey: "QuestionId",
        onDelete: "cascade",
      });
    }
    static async deleteques(qid) {
      return this.destroy({
        where: {
          id: qid,
        },
      });
    }
    static async FindQues(eid) {
      return this.findAll({
        where: {
          ElectionId: eid,
        },
      });
    }
  }
  questions.init(
    {
      question: DataTypes.STRING,
      desription: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "questions",
    }
  );
  return questions;
};
