const config = require("./../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { createAdmin, LoginAdmin } = require("../models/Admin");
const { createEmplayoee, LoginEmp } = require("../models/Employee");

exports.RegisterAdmin = async(req,res)=>{
    try{
      let hashpassword = bcrypt.hashSync(req.body.password, 10);
      const create = await createAdmin(req.body, hashpassword);
      return res.status(create.code).json({status:create.status,message:create.message});
    }catch(e){
      return res.status(500).json({status:"error",message:e.message});
    }
} 
exports.LoginAdmins = async(req,res)=>{
  try{
    const get = await LoginAdmin(req.body.email);
    if(get.status === "success"){
      if(get.message === null){
        return res.status(401).json({status: "error", message: "invalid credentials"});
      }
      if(get.message.status === false){
        return res.status(401).json({status: "error", message: "admin credentials not verified"});
      }
      let checkPassword = bcrypt.compareSync(
        req.body.password,
        get.message?.password
      );
      if (!checkPassword) {
        return res.status(401).json({status: "error", message: "invalid credentials"});
      }
      let key = process.env.APP_SECRET;
      let createtoken = jwt.sign(
        { userid: get.message.id, role: "admin" },
        key,
        { expiresIn: "7d" }
      );
      req.userid = get.message.id;
      req.role= "admin";
      return res.status(200).json({status: "success",
      message: {
        name:get.message.name,
        phone: get.message.phone,
        email: get.message.email,
        role:"admin",
        token: createtoken,
      }});
     
    }
    return res.status(401).json({status: "error", message: "invalid credentials"});
  }catch(e){
   return res.status(500).json({status: "error", message: e.message});
  }
} 
exports.RegisterEmployee = async(req,res)=>{
  try{
    let hashpassword = bcrypt.hashSync(req.body.password, 10);
    const create = await createEmplayoee(req.body, hashpassword);

    return res.status(create.code).json({status:create.status,message:create.message});
  }catch(e){
    return res.status(500).json({status:"error",message:e.message});
  }
} 
exports.LoginEmployee = async(req,res)=>{
  try{
    const get =  await LoginEmp(req.body.email);
    if(get.status === "success"){
      if(get.message === null){
        return res.status(401).json({status: "error", message: "invalid credentials"});
      }
      if(get.message.status === false){
        return res.status(401).json({status: "error", message: "employee is not active"});
      }
      if(get.message.employess_logins[0].on_maintance === true){
        return res.status(401).json({status: "error", message: "Account on maintance"});
      }
      let checkPassword = bcrypt.compareSync(
        req.body.password,
        get.message?.employess_logins[0]?.password
      );
      if (!checkPassword) {
        return res.status(401).json({status: "error", message: "invalid credentials"});
      }
      let key = process.env.APP_SECRET;
      let createtoken = jwt.sign(
        { userid: get.message.id, role: "employee" },
        key,
        { expiresIn: "7d" }
      );
      // req.userid = get.message.id;
      // req.role= "employee";
      return res.status(200).json({status: "success",
      message: {
        name:get.message.name,
        phone: get.message.phone,
        email: get.message.email,
        role:"employee",
        token: createtoken,
      }});
     
    }
    return res.status(401).json({status: "error", message: "invalid credentials"});
  }catch(e){
    return {code:500,status:"success",message:"internal error"}
  }
} 