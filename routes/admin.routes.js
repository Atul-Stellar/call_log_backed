const express = require("express");
const { isAdmin, verifyToken } = require("../middleware/authJwt");
const { AllEmployees, EmployeeCallLog, EmployeeCallsAnalysis } = require("../controllers/api/admin.conttroller");

const adminRoutes = express.Router();
adminRoutes.get('/employee',verifyToken, isAdmin, AllEmployees);
adminRoutes.get('/employee/call_log/:id',verifyToken, isAdmin, EmployeeCallLog);
adminRoutes.get('/employee/call_log/analysis/:id',verifyToken, isAdmin, EmployeeCallsAnalysis);
module.exports = adminRoutes;