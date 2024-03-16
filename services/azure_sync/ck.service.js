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

exports.getCkOrderReport = async (fromDate,toDate) => {
    let data = {
        fromdate:fromDate,
        todate:toDate
    };
 return await axios
    .post(
      process.env.AZURE_SYNC_URL + "/api/sap/ck/order/report",
      data,
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};
