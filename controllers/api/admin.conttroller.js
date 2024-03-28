const { DateIST } = require("../../helpers/dateHelper");
const { CallLogAll, gettotalcalls, gettotalcallsTypes } = require("../../models/Call_logs");
const { getAllEmployee } = require("../../models/Employee");


exports.AllEmployees = async(req,res)=>{
    try{
        let page = req.query.page || 1;
       let query = req.query.query || undefined;
        const get = await getAllEmployee(page, query);
        return res.status(get.code).json({status:get.status, message:get.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}

exports.EmployeeCallLog = async(req,res)=>{
    try{
        let page = req.query.page || 1;
        let query = req.query.query || undefined;
        let dates = req.query.date || DateIST();
        const get = await CallLogAll(req.params.id,page,query,dates);
        return res.status(get.code).json({status:get.status, message:get.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}

exports.EmployeeCallsAnalysis = async(req,res)=>{
    try{
        let dates = req.query.date || DateIST();
        let totalCalls = await gettotalcalls(req.params.id,dates);
        let totalMisscalls = await gettotalcallsTypes(req.params.id,dates,3)
        let totalIncomingcalls = await gettotalcallsTypes(req.params.id,dates,1)
        let totalOutgoingcalls = await gettotalcallsTypes(req.params.id,dates,2)
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