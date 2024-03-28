const db = require("../migrations");
const { DBlogged } = require("../config/log.config");

exports.genderList = async ()=>{
    try{
        return {
            code:200,
            status:"success",
            message: await db.gender_master.findAll({
                attributes:['id','name'],
            })
        }
     }catch(e){
        DBlogged.error(JSON.stringify(e));
        return {code:500,status:"error",message:e.parent.sqlMessage};
    }
}