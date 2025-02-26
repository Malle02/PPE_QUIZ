const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('report', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    operator_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    alarm_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    alarm_type: {
      type: DataTypes.UUID,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    observation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'report',
    schema: 'shared',
    timestamps: false,
    indexes: [
      {
        name: "idx_report_id",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_report_time",
        fields: [
          { name: "time" },
        ]
      },
      {
        name: "report_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
