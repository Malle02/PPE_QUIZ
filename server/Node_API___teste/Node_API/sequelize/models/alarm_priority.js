const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alarm_priority', {
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
    tableName: 'alarm_priority',
    schema: 'video_monitoring',
    timestamps: false,
    indexes: [
      {
        name: "alarm_priority_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
