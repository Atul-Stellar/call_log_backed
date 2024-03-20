const { CallLogAll } = require("../../models/Call_logs");
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
        const get = await CallLogAll(req.params.id,page,query);
        return res.status(get.code).json({status:get.status, message:get.message});
    }catch(e){
        return res.status(500).json({status: "error", message: e.message});
    }
}