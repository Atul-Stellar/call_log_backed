const axios = require("axios").default;
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

const config = {
  headers: {
    accesskey: process.env.AZURE_SYNC_KEY,
  },
};

exports.getCurrentDate = async () => {
 
 return await axios
    .get(
      process.env.AZURE_SYNC_URL + "/api/current_Date",
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};

exports.getCurrentDateSF = async () => {
 
    return await axios
       .get(
         process.env.AZURE_SYNC_URL + "/api/current_Date_sf",
         config
       )
       .then((res) => {
         return res.data;
       })
       .catch((e) => {
         return e.message;
       });
   };

