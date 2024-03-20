const db = require("../migrations");
const { DBlogged } = require("../config/log.config");
const { Op } = require("sequelize");
exports.createEmplayoee=async(data,password)=>{
    try{
        await db.employess.create({
            name:data.name,
            email:data.email,
            phone:data.phone,
            fk_gender_id:data.fk_gender_id, 
            status:data.status,
            employess_logins:{
                password:password,
                maintance_password:password,
                on_maintance:false,
            }
          },
          {
            include:{
                model:db.employess_login,
                as:"employess_logins"
            }
          })
          return {code:200,status:"success",message:"employee created successfully"};
    }catch(e){
        DBlogged.error(JSON.stringify(e));
        return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}

exports.LoginEmp = async(email)=>{
    try{
        return {
            code:200,
            status:"success",
            message:await db.employess.findOne({
                attributes:['id','email','name','phone'],
                include:[
                    {
                        attributes:["name"],
                        model:db.gender_master,
                        as:"fk_gender"
                    },
                    {
                        attributes:["password",'on_maintance'],
                        model:db.employess_login,
                        as:"employess_logins"
                    }
                ],
                where:{
                    email:email
                }
            })
        }
    }catch(e){
        DBlogged.error(JSON.stringify(e));
        return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}

exports.CheckEmployeeExistance = async(id)=>{
    try{
        return  await db.employess.count({
            where:{
                id:id,
            }
        })
     }catch(e){
        DBlogged.error(JSON.stringify(e));
        return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}

exports.getAllEmployee = async(page,query)=>{
    try{
        const skip = (page - 1) * 10;
        let totalPage;
        let totalRow;
        let get;
        if(query){
            totalPage = await db.employess.count({
                where:{
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { email: { [Op.like]: `%${query}%` } },
                        { phone: { [Op.like]: `%${query}%` } }
                    ]
                }
            })
            totalRow = totalPage;
            totalPage = Math.ceil(totalPage / 10);
            get = await db.employess.findAll({
                limit:10,
                offset:skip,
                where:{
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { email: { [Op.like]: `%${query}%` } },
                        { phone: { [Op.like]: `%${query}%` } }
                    ]
                }
            })
        }else{
            totalPage = await db.employess.count()
            totalRow = totalPage;
            totalPage = Math.ceil(totalPage / 10);
            get = await db.employess.findAll({
                limit:10,
                offset:skip,
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
        console.log(e)
        return {code:500,status:"error",message:e.parent.sqlMessage};
   }
}