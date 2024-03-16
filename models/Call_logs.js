const { DBlogged } = require("../config/log.config");
const { DateSTD } = require("../helpers/dateHelper");
const db = require("../migrations");

exports.CallLogCreate = async(data,userid)=>{
    try{
        let newData=[];
        if(data.length>0){
            data.map((e)=>{
                newData.push({
                    fk_employess_id:userid,
                    phone:e.number,
                    name:e.name,
                    fk_call_type:e.fk_call_type,
                    duration:e.duration,
                    date:e.date,
                    time:e.time
                })
            })
        }
        await db.call_logs.bulkCreate(newData)
        return {code:200,status:"success",message:"call log created successfully"};
    }catch(e){
    DBlogged.error(JSON.stringify(e));
    return {code:500,status:"error",message:e?.errors[0]?.message};
   }
}

exports.CallLogAll = async(userid)=>{
    try{
        return {
            code:200,
            status:"success",
            message : await db.call_logs.findAll({
                include:{
                    attributes:["id",'name'],
                    model: db.call_types,
                    as:"call_type"
                },
                where:{
                    fk_employess_id:userid
                }
            })
        }
    }catch(e){
    DBlogged.error(JSON.stringify(e));
    return {code:500,status:"error",message:e?.errors[0]?.message};
   }
}