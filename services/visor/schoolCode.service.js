const axios = require("axios").default;
const https = require("https");
const qs = require("qs");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;


exports.checkVisorSchoolCode = async (schoolCode)=>{
    let data = qs.stringify({
        grant_type:'password',
        client_id:'c2Nob29sX21pdHJh',
        secret:'Y2xhc3NrbGFwQDIwMjM=',
        schoolCode:schoolCode,
        
    })
    let config = {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }
    return await axios
    .post(
      "https://sbcontent.imaxprogram.com/app/v1/checkSchool",
      data,
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    }); 
}