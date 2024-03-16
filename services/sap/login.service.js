const axios = require("axios").default;
const https = require("https");
const public = require("../../models/public");
const URL = process.env.sap_URL;
require("dotenv").config();
var fs = require("fs");
const redisClient = require("../../config/redis.config");
console.log(process.env.sap_CompanyDB);
console.log(process.env.sap_UserName);
console.log(process.env.sap_Password);
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

exports.getLogin = (req, res) => {
  axios
    .post(URL + "/Login", {
      CompanyDB: process.env.sap_CompanyDB,
      UserName: process.env.sap_UserName,
      Password: process.env.sap_Password,
    })
    .then(async (ress) => {
      dataa = ress.data.SessionId;
      dataa1 = ress.headers["set-cookie"][1];
      var json = "B1SESSION=" + dataa + ";" + dataa1;
      console.log("login " + json);
      await redisClient.set("sap_login", json);
    })
    .catch((e) => {
      console.log(e.message);
    });
};

exports.getLoginRequest = (req, res) => {
  const ress = axios
    .post(URL + "/Login", {
      CompanyDB: process.env.sap_CompanyDB,
      UserName: process.env.sap_UserName,
      Password: process.env.sap_Password,
    })
    .then(async (ress) => {
      dataa = ress.data.SessionId;
      dataa1 = ress.headers["set-cookie"][1];
      var json = "B1SESSION=" + dataa + ";" + dataa1;
      console.log("login " + json);
      await redisClient.set("sap_login", json);
      return res.status(200).json({ status: "success", message: json });
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.getSapAutoLogin = async () => {
  return await axios
    .post(URL + "/Login", {
      CompanyDB: process.env.sap_CompanyDB,
      UserName: process.env.sap_UserName,
      Password: process.env.sap_Password,
    })
    .then(async (ress) => {
      dataa = ress.data.SessionId;
      dataa1 = ress.headers["set-cookie"][1];
      var json = "B1SESSION=" + dataa + ";" + dataa1;
      await redisClient.set("sap_login", json);
      return { status: "success" };
    })
    .catch((e) => {
      console.log(e.message);
    });
};

exports.getSapLoginToken = async () => {
  var saplogin = await redisClient.get("sap_login");
  if (saplogin) {
    return (config = {
      headers: {
        Cookie: saplogin,
      },
    });
  }
  let relogin = await this.getSapAutoLogin();
  if (relogin.status == "success") {
    console.log("relogin");
    return await this.getSapLoginToken();
  }
};

exports.getCKLoginRequest = (req, res) => {
  const ress = axios
    .post(URL + "/Login", {
      CompanyDB: process.env.sap_CompanyDB,
      UserName: process.env.sap_UserName,
      Password: process.env.sap_Password,
    })
    .then(async (ress) => {
      console.log(ress.data);
      dataa = ress.data.SessionId;
      dataa1 = ress.headers["set-cookie"][1];
      session = { session: dataa, route: dataa1 };
      return res
        .status(200)
        .json({ status: "success", session: dataa, route: dataa1 });
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.delSapToken = async()=>{
  var saplogin = await redisClient.get("sap_login");
  if(saplogin){
    await redisClient.del("sap_login");
    return {status:"success"}
  }
  return {status:"error"}

}
