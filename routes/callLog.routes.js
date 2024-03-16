const express = require("express");
const { validate } = require('express-validation');
const { callLogStoreSchema } = require("../validators/callLogValidators");
const { isEmployee, verifyToken } = require("../middleware/authJwt");
const { storeCallLogs, getAllCallLogs } = require("../controllers/api/callRecord.controller");

const callLogRoutes = express.Router();
callLogRoutes.get('/',verifyToken,isEmployee, getAllCallLogs);
callLogRoutes.post('/',validate(callLogStoreSchema, {}, {}),verifyToken,isEmployee, storeCallLogs);
module.exports = callLogRoutes;