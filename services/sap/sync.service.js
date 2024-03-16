// const cron = require("node-cron");
// const sales_data =  require('../../models/sales_data');
// const users = require('../../models/users');
// const public = require('../../models/public');
// const locations  = require('../../models/locations');
// const redisClient = require("../../config/redis.config");
const {  InitBpMaster } = require("./bpMaster.service");


const syncBps = async()=>{
    console.log("sync calling")
    InitBpMaster()  
};


function BpAllSync(data,link){
    console.log("bpsync")
};

module.exports={
    syncBps : syncBps,
    BpAllSync : BpAllSync
 };

