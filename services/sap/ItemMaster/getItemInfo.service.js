require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const { getLogin, getSapLoginToken } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

exports.getItemInfoSap = async(itemcode)=>{
  let config = await getSapLoginToken()
  return await  getData(config,itemcode)
}

    const getData = async(token,itemcode)=>{
     
        const ress = await axios
        .get(
          process.env.sap_URL +
            "/Items?$select=ItemCode,ItemName,UpdateDate,ItemsGroupCode,U_Grade,U_Series,U_Subject,U_Type,U_CRM_Item,UpdateTime,UpdateDate,ItemPrices&$filter=ItemCode eq'"+itemcode+"'",
            token
        )
        .catch((e) => console.log(e));
      if (ress) {
     
       return {status:"success",message:ress.data}
      }
      return {status:"error",message:""};
    }
   


  
