const { CallLogCreate, CallLogAll } = require("../../models/call_logs");


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
        const get = await CallLogAll(req.userid);
        return res.status(get.code).json({status:get.status,message:get.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}