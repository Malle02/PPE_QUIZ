const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('video_alarm_definition', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    camera_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    priority_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    trigger_event_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'video_alarm_definition',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "video_alarm_definition_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
