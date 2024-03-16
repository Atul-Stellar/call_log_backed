const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

const InitBpMaster = () => {
  try {
    (async () => {
      console.log("InitBpMaster calling");
      var saplogin = await redisClient.get("sap_login");
      if (saplogin) {
        var spToken = saplogin;
        let config = {
          headers: {
            Cookie: spToken,
          },
        };
        const ress = await axios.get(
          process.env.sap_URL + "/BusinessPartners",
          config
        );
        let newLink = Object.values(ress.data)[2];
        let data = ress.data;
        console.log("tests");
        BpAllSync(data, newLink);
        //  return res.status(200).json({status:'error',message: ress.data,link:Object.values(ress.data)[2]});
      }
    })();
  } catch (e) {
    console.log(e);
  }
};

const BpMasterPaging = (link) => {
  try {
    (async () => {
      var saplogin = await redisClient.get("sap_login");
      if (saplogin) {
        var spToken = saplogin;
        let config = {
          headers: {
            Cookie: spToken,
          },
        };
        if (link) {
          const ress = await axios.get(
            process.env.sap_URL + "/" + link,
            config
          );
          let newLink = Object.values(ress.data)[2];
          let data = ress.data;
          // BpAllSync(data,newLink)
          //  return res.status(200).json({status:'error',message: ress.data,link:Object.values(ress.data)[2]});
        }
      }
    })();
  } catch (e) {
    console.log(e);
  }
};

module.exports = { InitBpMaster, BpMasterPaging };
