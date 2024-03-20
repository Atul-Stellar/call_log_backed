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
        const get = await CallLogAll(req.userid,page,query);
        return res.status(get.code).json({status:get.status,message:get.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}