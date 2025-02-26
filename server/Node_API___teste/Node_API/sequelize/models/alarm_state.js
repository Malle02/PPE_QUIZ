const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alarm_state', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'alarm_state',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "alarm_state_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
