var express = require('express');
const  router = express.Router();
let authRoutes = require("./auth.routes");
const callLogRoutes = require('./callLog.routes');

router.get('/', async(req, res)=>{
    return res.status(200).json("test")
})
router.use('/auth',authRoutes);
router.use('/call_log',callLogRoutes);
module.exports = router;

