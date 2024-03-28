const express = require("express");
const { validate } = require('express-validation');
const { callLogStoreSchema } = require("../validators/callLogValidators");
const { isEmployee, verifyToken } = require("../middleware/authJwt");
const { storeCallLogs, getAllCallLogs, CallsAnalysis } = require("../controllers/api/employee.controller");

const EmployeeRoutes = express.Router();
EmployeeRoutes.get('/call_log',verifyToken,isEmployee, getAllCallLogs);
EmployeeRoutes.get('/call_log/analysis',verifyToken,isEmployee, CallsAnalysis);
EmployeeRoutes.post('/call_log',validate(callLogStoreSchema, {}, {}),verifyToken,isEmployee, storeCallLogs);
module.exports = EmployeeRoutes;