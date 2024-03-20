const express = require("express");
const { isAdmin, verifyToken } = require("../middleware/authJwt");
const { AllEmployees, EmployeeCallLog } = require("../controllers/api/admin.conttroller");

const adminRoutes = express.Router();
adminRoutes.get('/employee',verifyToken, isAdmin, AllEmployees);
adminRoutes.get('/employee/call_log/:id',verifyToken, isAdmin, EmployeeCallLog);
module.exports = adminRoutes;