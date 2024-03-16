const express = require("express");
const { RegisterAdmin,LoginAdmins,RegisterEmployee,LoginEmployee } = require("../controllers/auth.controller");
const authRoutes = express.Router();
const {RegisterAdminValidator,LoginAdminValidator,RegisterEmpValidator} = require("../validators/authValidators");
const { validate } = require('express-validation')
// const {handleValidationErrors} = require("../middleware/handleValidationErrors");

authRoutes.post('/admin/register',validate(RegisterAdminValidator, {}, {}), RegisterAdmin);
authRoutes.post('/admin/login',validate(LoginAdminValidator, {}, {}), LoginAdmins);
authRoutes.post('/employee/register',validate(RegisterEmpValidator, {}, {}), RegisterEmployee);
authRoutes.post('/employee/login',validate(LoginAdminValidator, {}, {}), LoginEmployee);


module.exports = authRoutes;
