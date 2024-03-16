const jwt = require("jsonwebtoken");
const { CheckAdminExistance } = require("../models/Admin");
const { CheckEmployeeExistance } = require("../models/Employee.js");

exports.verifyToken = async(req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decode = jwt.verify(token, process.env.APP_SECRET);
    console.log(process.env.APP_SECRET)
    console.log(decode.userid)
    req.userid = decode.userid;
    req.role = decode.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
exports.isAdmin = async (
  req,
  res,
  next
) => {
  let id = req.userid;
  if (!id) {
    return res.status(401).json({status:"error", message: "Invalid token" });
  }
  if(req.role !== "admin"){
    return res.status(401).json({status:"error", message: "admin role is required" });
  }
  const check = await CheckAdminExistance(id);
  console.log(check);
  if (check == 0) {
    return res.status(401).json({status:"error", message: "Invalid user token" });
  }
  next();
};

exports.isEmployee = async (
  req,
  res,
  next
) => {
  let id = req.userid;
  console.log(id)
  if (!id) {
    return res.status(401).json({status:"error", message: "Invalid token" });
  }
  if(req.role !== "employee"){
    return res.status(401).json({status:"error", message: "employee role is required" });
  }
  const check = await CheckEmployeeExistance(id);
  console.log(check);
  if (check == 0) {
    return res.status(401).json({status:"error", message: "Invalid user token" });
  }
  next();
};

