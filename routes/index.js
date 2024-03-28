var express = require('express');
const  router = express.Router();
let authRoutes = require("./auth.routes");
const adminRoutes = require('./admin.routes');
const EmployeeRoutes = require('./employee.routes');

router.get('/', async(req, res)=>{
    return res.status(200).json("test")
})
router.use('/auth',authRoutes);
router.use('/',EmployeeRoutes);
router.use('/admin',adminRoutes);
module.exports = router;

