const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('operator', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'operator',
    schema: 'operator_management',
    timestamps: false,
    indexes: [
      {
        name: "operator_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "operator_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
