const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('call_logs', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    fk_employess_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'employess',
        key: 'id'
      }
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fk_call_type: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'call_types',
        key: 'id'
      }
    },
    duration: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'call_logs',
    timestamps: true,
    underscored:true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "call_logs_call_types_FK",
        using: "BTREE",
        fields: [
          { name: "fk_call_type" },
        ]
      },
      {
        name: "call_logs_employess_FK",
        using: "BTREE",
        fields: [
          { name: "fk_employess_id" },
        ]
      },
    ]
  });
};
