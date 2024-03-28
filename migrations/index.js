
const sequelize = require('../config/db.config');
const db = {};
const initModelsL = require('./init-models')
const model = initModelsL(sequelize)
    db.admin=model.admin;
    db.call_logs = model.call_logs;
    db.call_types = model.call_types;
    db.employess = model.employess;
    db.employess_login = model.employess_login;
    db.gender_master = model.gender_master;
    db.acdemy_center = model.acdemy_center
    db.states = model.states
    db.city = model.city
    db.call_logs_comments = model.call_logs_comments
module.exports = db