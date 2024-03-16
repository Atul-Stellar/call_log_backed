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

exports.getLedgerDetail = async (todate, fromdate,bpcode) => {
  let data = {
    todate: todate,
    fromdate: fromdate,
    bpcode:bpcode
  };
  console.log(process.env.AZURE_SYNC_URL);
 return await axios
    .post(
      process.env.AZURE_SYNC_URL+"/api/doc_print/legder/detail",
      data,
      config
    )
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};
