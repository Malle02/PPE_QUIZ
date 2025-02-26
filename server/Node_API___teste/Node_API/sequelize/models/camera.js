const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('camera', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    uri: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    recorder_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ptz_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    live: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    default_stream_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    default_stream_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    codec: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    resolution: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    protocol: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    fps: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    control_mode: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'camera',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "camera_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "camera_uri_key",
        unique: true,
        fields: [
          { name: "uri" },
        ]
      },
    ]
  });
};
