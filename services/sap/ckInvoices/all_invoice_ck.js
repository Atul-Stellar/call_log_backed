require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const { getSapLoginToken } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

exports.InvCk = async (link) => {
  let config = await getSapLoginToken()
      if (link === "NA") {
        const ress = await axios
          .get(
            process.env.sap_URL +
              "/Invoices?$select=DocEntry,DocDate,CardCode,U_SCode,U_SName,CardName,DocTotal,DocNum,DocumentLines,EWayBillDetails&$filter=CreationDate%20gt%202022-10-01",
            config
          )
          .catch((e) => console.log(e.message));
        if (ress) {
          let newLink = Object.values(ress.data)[2];
          let data = ress.data;
          let dat = await allSync(data, newLink);
          return dat;
        }
      } else if (link && link !== "NA") {
        const ress = await axios
          .get(process.env.sap_URL + "/"+link, config)
          .catch((e) => console.log(e.message));
        if (ress) {
          let newLink = Object.values(ress.data)[2];
          let data = ress.data;
          let dm = await allSync(data, newLink);
          //  console.log(dm)
          return dm;
        }
      }

};

const allSync = async (data, link) => {
  let allInv = [];
  let datas = data.value;
  let response = await Promise.all(
    datas.map(async (e) => {
      allInv.push(e);
      return allInv;
    })
  );
  if (link != "") {
    console.log(link);
    allInv.push({ link: link });
  }
  return response;
};
