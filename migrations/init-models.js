var DataTypes = require("sequelize").DataTypes;
var _acdemy_center = require("./acdemy_center");
var _admin = require("./admin");
var _call_logs = require("./call_logs");
var _call_logs_comments = require("./call_logs_comments");
var _call_types = require("./call_types");
var _city = require("./city");
var _employess = require("./employess");
var _employess_login = require("./employess_login");
var _gender_master = require("./gender_master");
var _states = require("./states");

function initModels(sequelize) {
  var acdemy_center = _acdemy_center(sequelize, DataTypes);
  var admin = _admin(sequelize, DataTypes);
  var call_logs = _call_logs(sequelize, DataTypes);
  var call_logs_comments = _call_logs_comments(sequelize, DataTypes);
  var call_types = _call_types(sequelize, DataTypes);
  var city = _city(sequelize, DataTypes);
  var employess = _employess(sequelize, DataTypes);
  var employess_login = _employess_login(sequelize, DataTypes);
  var gender_master = _gender_master(sequelize, DataTypes);
  var states = _states(sequelize, DataTypes);

  employess.belongsTo(acdemy_center, { as: "fk_academy_center", foreignKey: "fk_academy_center_id"});
  acdemy_center.hasMany(employess, { as: "employesses", foreignKey: "fk_academy_center_id"});
  call_logs_comments.belongsTo(call_logs, { as: "fk_call_log", foreignKey: "fk_call_logs_id"});
  call_logs.hasMany(call_logs_comments, { as: "call_logs_comments", foreignKey: "fk_call_logs_id"});
  call_logs.belongsTo(call_types, { as: "fk_call_type_call_type", foreignKey: "fk_call_type"});
  call_types.hasMany(call_logs, { as: "call_logs", foreignKey: "fk_call_type"});
  acdemy_center.belongsTo(city, { as: "fk_city", foreignKey: "fk_city_id"});
  city.hasMany(acdemy_center, { as: "acdemy_centers", foreignKey: "fk_city_id"});
  acdemy_center.belongsTo(employess, { as: "fk_employess", foreignKey: "fk_employess_id"});
  employess.hasMany(acdemy_center, { as: "acdemy_centers", foreignKey: "fk_employess_id"});
  call_logs.belongsTo(employess, { as: "fk_employess", foreignKey: "fk_employess_id"});
  employess.hasMany(call_logs, { as: "call_logs", foreignKey: "fk_employess_id"});
  call_logs_comments.belongsTo(employess, { as: "fk_employess", foreignKey: "fk_employess_id"});
  employess.hasMany(call_logs_comments, { as: "call_logs_comments", foreignKey: "fk_employess_id"});
  employess_login.belongsTo(employess, { as: "fk_employess", foreignKey: "fk_employess_id"});
  employess.hasMany(employess_login, { as: "employess_logins", foreignKey: "fk_employess_id"});
  employess.belongsTo(gender_master, { as: "fk_gender", foreignKey: "fk_gender_id"});
  gender_master.hasMany(employess, { as: "employesses", foreignKey: "fk_gender_id"});
  city.belongsTo(states, { as: "fk_state", foreignKey: "fk_states_id"});
  states.hasMany(city, { as: "cities", foreignKey: "fk_states_id"});

  return {
    acdemy_center,
    admin,
    call_logs,
    call_logs_comments,
    call_types,
    city,
    employess,
    employess_login,
    gender_master,
    states,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
