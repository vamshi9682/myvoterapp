"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class elections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      elections.belongsTo(models.Admin, {
        foreignKey: "AdminId",
      });
      elections.hasMany(models.questions, {
        foreignKey: "ElectionId",
        onDelete: "cascade",
      });
    }

    static async FindElection(id) {
      return this.findByPk(id);
    }

    static async createelection({ title, AdminId }) {
      return this.create({
        title: title,
        launched: false,
        AdminId: AdminId,
      });
    }

    static async getElections(id) {
      return this.findAll({
        where: {
          end: false,
          launched: false,
          AdminId: id,
        },
      });
    }

    static async ongoing(id) {
      return this.findAll({
        where: {
          end: false,
          launched: true,
          AdminId: id,
        },
      });
    }
    static async completed(id) {
      return this.findAll({
        where: {
          end: true,
          launched: false,
          AdminId: id,
        },
      });
    }

    setLaunchStatus(completed) {
      return this.update({ launched: completed });
    }
    setCompletionStatus(completed) {
      return this.update({ end: completed });
    }
    static async deleteelec(eid, aid) {
      return this.destroy({
        where: {
          id: eid,
          AdminId: aid,
        },
      });
    }
  }
  elections.init(
    {
      name: DataTypes.STRING,
      launched: DataTypes.BOOLEAN,
      end: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "elections",
    }
  );
  return elections;
};
