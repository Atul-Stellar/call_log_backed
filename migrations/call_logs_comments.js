const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('call_logs_comments', {
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
    fk_call_logs_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'call_logs',
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'call_logs_comments',
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
        name: "call_logs_comments_call_logs_FK",
        using: "BTREE",
        fields: [
          { name: "fk_call_logs_id" },
        ]
      },
      {
        name: "call_logs_comments_employess_FK",
        using: "BTREE",
        fields: [
          { name: "fk_employess_id" },
        ]
      },
    ]
  });
};
