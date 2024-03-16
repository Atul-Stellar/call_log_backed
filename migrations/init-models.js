var DataTypes = require("sequelize").DataTypes;
var _admin = require("./admin");
var _call_logs = require("./call_logs");
var _call_types = require("./call_types");
var _employess = require("./employess");
var _employess_login = require("./employess_login");
var _gender_master = require("./gender_master");

function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes);
  var call_logs = _call_logs(sequelize, DataTypes);
  var call_types = _call_types(sequelize, DataTypes);
  var employess = _employess(sequelize, DataTypes);
  var employess_login = _employess_login(sequelize, DataTypes);
  var gender_master = _gender_master(sequelize, DataTypes);

  call_logs.belongsTo(call_types, { as: "call_type", foreignKey: "fk_call_type"});
  call_types.hasOne(call_logs, { as: "call_logs", foreignKey: "fk_call_type"});
  call_logs.belongsTo(employess, { as: "fk_employess", foreignKey: "fk_employess_id"});
  employess.hasMany(call_logs, { as: "call_logs", foreignKey: "fk_employess_id"});
  employess_login.belongsTo(employess, { as: "fk_employess", foreignKey: "fk_employess_id"});
  employess.hasMany(employess_login, { as: "employess_logins", foreignKey: "fk_employess_id"});
  employess.belongsTo(gender_master, { as: "fk_gender", foreignKey: "fk_gender_id"});
  gender_master.hasMany(employess, { as: "employesses", foreignKey: "fk_gender_id"});

  return {
    admin,
    call_logs,
    call_types,
    employess,
    employess_login,
    gender_master,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
