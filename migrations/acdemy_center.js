const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('acdemy_center', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fk_employess_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    fk_city_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'city',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'acdemy_center',
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
        name: "acdemy_center_city_FK",
        using: "BTREE",
        fields: [
          { name: "fk_city_id" },
        ]
      },
    ]
  });
};
