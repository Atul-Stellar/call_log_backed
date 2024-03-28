const { DateIST } = require("../../helpers/dateHelper");
const { CallLogCreate, CallLogAll } = require("../../models/Call_logs");


exports.storeCallLogs = async(req,res)=>{
    try{
        const create = await CallLogCreate(req.body,req.userid);
        return res.status(create.code).json({status:create.status,message:create.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}

exports.getAllCallLogs = async(req,res)=>{
    try{
        let page = req.query.page || 1;
        let query = req.query.query || undefined;
        let dates = req.query.date || DateIST();
        const get = await CallLogAll(req.userid,page,query,dates);
        return res.status(get.code).json({status:get.status,message:get.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}
exports.CallsAnalysis = async(req,res)=>{
    try{
        let dates = req.query.date || DateIST();
        let totalCalls = await gettotalcalls(req.userid,dates);
        let totalMisscalls = await gettotalcallsTypes(req.userid,dates,3)
        let totalIncomingcalls = await gettotalcallsTypes(req.userid,dates,1)
        let totalOutgoingcalls = await gettotalcallsTypes(req.userid,dates,2)
        return res.status(200).json({status:"success", message:{
            totalCalls: totalCalls,
            totalIncomingcalls:totalIncomingcalls,
            totalOutgoingcalls:totalOutgoingcalls,
            totalMisscalls:totalMisscalls

        }});
     }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}