const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recorder', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    uri: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    host_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'recorder',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "recorder_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
