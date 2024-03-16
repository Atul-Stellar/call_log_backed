const { DBlogged } = require("../config/log.config");
const db = require("../migrations");

exports.createAdmin= async(data,password)=>{
   try{
    await db.admin.create({
        name:data.name,
        email:data.email,
        phone:data.phone,
        password:password, 
        status:false
      })
      return {code:200,status:"success",message:"admin created successfully"};
   }catch(e){
    DBlogged.error(JSON.stringify(e));
    return {code:500,status:"error",message:e?.errors[0]?.message};
   }
}

exports.LoginAdmin = async(email)=>{
    try{
        return {
            code:200,
            status:"success",
            message:await db.admin.findOne({
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

exports.CheckAdminExistance = async(id)=>{
    try{
        return  await db.admin.count({
                where:{
                    id:id,
                }
            })
        
    }catch(e){
        DBlogged.error(JSON.stringify(e));
        return {code:500,status:"error",message:e?.errors[0]?.message};
   }
}