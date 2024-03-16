const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('employess_login', {
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
    password: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    maintance_password: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    on_maintance: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'employess_login',
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
        name: "employess_login_employess_FK",
        using: "BTREE",
        fields: [
          { name: "fk_employess_id" },
        ]
      },
    ]
  });
};
