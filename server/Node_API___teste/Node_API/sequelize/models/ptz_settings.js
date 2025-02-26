const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ptz_settings', {
    camera_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    is_center_on_position_in_view_supported: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    is_ptz_diagonal_supported: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    is_ptz_home_supported: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ptz_settings',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "ptz_settings_pkey",
        unique: true,
        fields: [
          { name: "camera_id" },
        ]
      },
    ]
  });
};
