const users = require("../../models/users")
const { Op } = require("sequelize");
const _ = require("lodash"); 

exports.AccessCodeId = async ()=>{
    try{
        const getAll = await users.user_master.findAll({
            attributes:['emp_id'],
            where:{
                emp_id:{
                    [Op.like]:'%ASK%'
                }
            }
        })
        if(getAll.length ==0){
            return "ASK"+1;
        }
        let count = [];
         getAll.map((e)=>{
            let str = e.emp_id;
            count.push(parseInt(str.replace('ASK','')));
        })
        console.log(count)
        if(count.length == 0){
            return "ASK"+1;
        }
        return "ASK"+(_.max(count)+1);
        
    }catch(e){
        return e.message
    }
}