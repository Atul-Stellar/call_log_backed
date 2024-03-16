const redisClient = require("../../config/redis.config");
require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const qs = require("qs");

const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  axios.defaults.httpsAgent = agent;
  
exports.ckLogin = async()=>{
    let datas = qs.stringify({
        grant_type:process.env.CK_GRANT_TYPE,
        client_id:process.env.CK_CLIENT_ID,
        secret:process.env.CK_SECRET,
        email:process.env.CK_EMAIL,
    })
    axios.post(process.env.CK_VISOR_URL+'/v1/login/eupheus',datas)
    .then( async(res)=>{
        console.log("ck login");
        await redisClient.set("ck_login", res.data.accessToken);
        return { status: "success", message: res.data };
    }).catch((e)=>{
        console.log(e.data);
        return{ status: "error", message: e.data };
    })
}
