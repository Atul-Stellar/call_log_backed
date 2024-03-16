const db = require("../migrations");
const { DBlogged } = require("../config/log.config");
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
        return {code:500,status:"error",message:e?.errors[0]?.message};
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
        return {code:500,status:"error",message:e?.errors[0]?.message};
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
        return {code:500,status:"error",message:e?.errors[0]?.message};
   }
}