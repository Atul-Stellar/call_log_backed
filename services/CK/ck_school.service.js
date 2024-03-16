const redisClient = require("../../config/redis.config");
require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const qs = require("qs");
const { ckLogin } = require("./ck_login.service");

const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  axios.defaults.httpsAgent = agent;
  exports.getCKStates = async()=>{
    let ckLogins = await redisClient.get('ck_login');
    if(!ckLogins){
      console.log("test");
    let lg =  await ckLogin();
    if(lg){
      ckLogins = await redisClient.get('ck_login');
      if(ckLogins){
        await this.getCKStates();
      }
    }
    }
    ckLogins = "Bearer "+ckLogins;
    console.log(ckLogins);
    let config = {
        headers: {
            Authorization: ckLogins,
        },
      };
   return axios.get(process.env.CK_VISOR_URL+'/visor/stateEnums',config)
    .then( async(res)=>{
      console.log(res);
        return res.data;
    }).catch((e)=>{
        console.log(e);
        return e.data ;
    })
  }

  exports.CKSchoolFromState = async(stateName)=>{
    let ckLogins = await redisClient.get('ck_login');
    if(!ckLogins){
    let lg =  await ckLogin();
    if(lg){
      ckLogins = await redisClient.get('ck_login');
      if(ckLogins){
        await this.getCKStates();
      }
    }
    }
    ckLogins = "Bearer "+ckLogins;
    console.log(ckLogins);
    let config = {
        headers: {
            Authorization: ckLogins,
        },
      };
   return axios.get(process.env.CK_VISOR_URL+'/visor/schools/'+stateName,config)
    .then( async(res)=>{
        return res.data;
    }).catch((e)=>{
        console.log(e);
        return e.data ;
    })
  }

  exports.CKSchoolFromCode = async(Schoolcode)=>{
    let ckLogins = await redisClient.get('ck_login');
    if(!ckLogins){
    let lg =  await ckLogin();
    if(lg){
      ckLogins = await redisClient.get('ck_login');
      if(ckLogins){
        await this.getCKStates();
      }
    }
    }
    ckLogins = "Bearer "+ckLogins;
    console.log(ckLogins);
    let config = {
        headers: {
            Authorization: ckLogins,
        },
      };
   return axios.get(process.env.CK_VISOR_URL+'/visor/school/'+Schoolcode,config)
    .then( async(res)=>{
        return res.data;
    }).catch((e)=>{
        console.log(e);
        return e.data ;
    })
  }