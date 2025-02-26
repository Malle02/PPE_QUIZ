const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('video_alarm', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    alarm_definition_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    report_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'video_alarm',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "idx_video_alarm_id",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_video_alarm_time",
        fields: [
          { name: "time" },
        ]
      },
      {
        name: "video_alarm_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "video_alarm_report_id_key",
        unique: true,
        fields: [
          { name: "report_id" },
        ]
      },
    ]
  });
};
