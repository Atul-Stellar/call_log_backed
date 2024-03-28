const { DBlogged } = require("../config/log.config");
const { DateSTD } = require("../helpers/dateHelper");
const { Op } = require("sequelize");
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
    return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}

exports.CallLogAll = async(userid, page,query,dates)=>{
    try{
        const skip = (page - 1) * 10;
        let totalPage;
        let totalRow;
        let get;
        if(query){
            totalPage = await db.call_logs.count({
                where:{
                    fk_employess_id:userid,
                    date:dates,
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { phone: { [Op.like]: `%${query}%` } },
                        { date: { [Op.like]: `%${query}%` } }
                    ]
                }
            })
            totalRow = totalPage;
            totalPage = Math.ceil(totalPage / 10);
            get =await db.call_logs.findAll({
                include:{
                    attributes:["id",'name'],
                    model: db.call_types,
                    as:"fk_call_type_call_type"
                },
                limit:10,
                offset:skip,
                order: [
                    ['id', 'DESC'],
                ],
                where:{
                    fk_employess_id:userid,
                    date:dates,
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { phone: { [Op.like]: `%${query}%` } },
                        { date: { [Op.like]: `%${query}%` } }
                    ]
                }
            })
        }else{
            totalPage = await db.call_logs.count({
                where:{
                    fk_employess_id:userid,
                    date:new Date(dates),
                }
            })
            totalRow = totalPage;
            totalPage = Math.ceil(totalPage / 10);
            get =await db.call_logs.findAll({
                include:{
                    attributes:["id",'name'],
                    model: db.call_types,
                    as:"fk_call_type_call_type"
                },
                limit:10,
                offset:skip,
                order: [
                    ['id', 'DESC'],
                ],
                where:{
                    fk_employess_id:userid,
                    date:new Date(dates),
                }
            })
        }
        return {
            code:200,
            status:"success",
            message:{
                data:get,
                totalPage:totalPage,
                totalRow:totalRow
            } 
        }
    }catch(e){
    DBlogged.error(JSON.stringify(e));
        
    return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}

exports.gettotalcalls = async(userid,date)=>{
    try{
        return  await db.call_logs.count({
            where:{
                date:new Date(date),
                fk_employess_id:userid,
            }
        })
     }catch(e){
    DBlogged.error(JSON.stringify(e));
    return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}
exports.gettotalcallsTypes = async(userid,date,type)=>{
    try{
        return  await db.call_logs.count({
            where:{
                date:new Date(date),
                fk_employess_id:userid,
                fk_call_type:type
            }
        })
     }catch(e){
    DBlogged.error(JSON.stringify(e));
    return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}