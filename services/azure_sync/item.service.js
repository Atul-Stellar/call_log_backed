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

exports.getItemDetailFromAzure = async (itemcode) => {
   
 return await axios
    .get(
      process.env.AZURE_SYNC_URL + "/api/item/code/get/"+itemcode,

      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};
