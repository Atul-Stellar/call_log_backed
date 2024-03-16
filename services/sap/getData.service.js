const axios = require("axios").default;
const https = require("https");
const URL = process.env.sap_URL;
const redisClient = require("../../config/redis.config");
const syncBps = require("./bpMaster/masterbp.service");
const syncUsers = require("./userMaster/masterUser.service");
const syncEUPInv = require("./eupInvoice/masterEupInv");
const syncCreditMaster = require("./credit/creditMaster.service");
const { EupInvSoNo } = require("./eupInvoice/autoSyncEupInvNo.service");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

exports.testSap = async (req, res) => {
  //  await syncSchoolCkInvoice();
  // await syncSchoolCkOrders();
// const d = await getTotalInvCount();
// const d = await users.user_master.findAll({
//   attributes:['emp_id'],
//   where: { emp_id: { [Op.notLike]: "%ASK%" } },
// }) 
// return res.send(d);
// await syncBps(); 
// await syncUsers()
// await syncCreditMaster()
await EupInvSoNo();

// await syncEUPInv("Invoices?$select=DocEntry,SalesPersonCode,DocNum,DocDate,CardCode,U_Boxes,GSTTransactionType,U_SCode,U_SName,CardName,DocTotal,DocumentLines,EWayBillDetails&$filter=CreationDate%20gt%202022-04-01&$skip=11900");

return res.send("test");
};

exports.getBpMaster = async (req, res) => {
  try {
    (async () => {
      console.log(req);
      console.log("bpMaster calling");
      var saplogin = await redisClient.get("sap_login");
      if (saplogin) {
        var spToken = saplogin;
        let config = {
          headers: {
            Cookie: spToken,
          },
        };
        if (req.body.link) {
          const ress = await axios.get(URL + "/" + req.body.link, config);
          let newLink = Object.values(ress.data)[2];
          let data = ress.data;
          // BpAllSync(data,newLink)
          return res
            .status(200)
            .json({
              status: "error",
              message: ress.data,
              link: Object.values(ress.data)[2],
            });
        } else {
          const ress = await axios.get(URL + "/BusinessPartners", config);
          let newLink = Object.values(ress.data)[2];
          let data = ress.data;
          // BpAllSync(newLink,data)
          // BpAllSync(data,newLink)
          return res
            .status(200)
            .json({
              status: "error",
              message: ress.data,
              link: Object.values(ress.data)[2],
            });
        }
      }
    })();
  } catch (e) {
    console.log(e);
  }
};
exports.getIUserMaster = async (req, res) => {
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
        if (req.body.link) {
          const ress = await axios.get(URL + "/" + req.body.link, config);
          return res
            .status(200)
            .json({
              status: "error",
              message: ress.data,
              link: Object.values(ress.data)[2],
            });
        } else {
          const ress = await axios.get(URL + "/EmployeesInfo", config);
          return res
            .status(200)
            .json({
              status: "error",
              message: ress.data,
              link: Object.values(ress.data)[2],
            });
        }
      }
    })();
  } catch (e) {
    console.log(e);
  }
};

exports.getIteMaster = async (req, res) => {
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
        if (req.body.link) {
          const ress = await axios.get(URL + "/" + req.body.link, config);
          return res
            .status(200)
            .json({
              status: "error",
              message: ress.data,
              link: Object.values(ress.data)[2],
            });
        } else {
          const ress = await axios.get(
            URL +
              "/Items?$select=ItemCode,ItemName,UpdateDate,ItemsGroupCode,U_Grade,U_Series,U_Subject,U_Type,U_CRM_Item,UpdateTime,UpdateDate,ItemPrices&$filter=U_CRM_Item eq'Y'",
            config
          );
          return res
            .status(200)
            .json({
              status: "error",
              message: ress.data,
              link: Object.values(ress.data)[2],
            });
        }
      }
    })();
  } catch (e) {
    console.log(e);
  }
};
exports.getBpMasterWithCode = async (req, res) => {
  try {
    (async () => {
      var saplogin = await redisClient.get("sap_login");
      if (saplogin) {
        var spToken = saplogin;
        let config = {
          headers: {
            Cookie:
              "B1SESSION=" +
              JSON.stringify(spToken.data)
                .split(",")[0]
                .split(":")[1]
                .replace('"', "")
                .replace('"', "") +
              ";" +
              JSON.stringify(spToken.data)
                .split(",")[1]
                .split(":")[1]
                .replace("]", "")
                .replace("}", "")
                .replace('"', "")
                .replace('"', ""),
          },
        };
        if (req.body.link) {
          const ress = await axios
            .get(URL + "/BusinessPartners" + req.body.link, config)
            .catch((e) => {
              console.log(e);
            });

          if (ress) {
            return res
              .status(200)
              .json({ status: "success", message: ress.data });
          }
          return res
            .status(200)
            .json({ status: "error", message: "code not found" });
        } else {
          return res.status(200).json({ status: "error", message: "404" });
        }
      }
    })();
  } catch (e) {
    console.log(e);
  }
};
exports.getItemMasterWithCode = async (req, res) => {
  try {
    (async () => {
      var saplogin = await redisClient.get("sap_login");
      if (saplogin) {
        var spToken = saplogin;
        let config = {
          headers: {
            Cookie:
              "B1SESSION=" +
              JSON.stringify(spToken.data)
                .split(",")[0]
                .split(":")[1]
                .replace('"', "")
                .replace('"', "") +
              ";" +
              JSON.stringify(spToken.data)
                .split(",")[1]
                .split(":")[1]
                .replace("]", "")
                .replace("}", "")
                .replace('"', "")
                .replace('"', ""),
          },
        };
        if (req.body.link) {
          const ress = await axios
            .get(
              URL +
                "/Items?$select=ItemCode,ItemName,UpdateDate,ItemsGroupCode,U_Grade,U_Series,U_Subject,U_Type,U_CRM_Item,UpdateTime,UpdateDate,ItemPrices&$filter=U_CRM_Item eq'Y'" +
                req.body.link,
              config
            )
            .catch((e) => {
              console.log(e);
            });

          if (ress) {
            return res
              .status(200)
              .json({ status: "success", message: ress.data });
          }
          return res
            .status(200)
            .json({ status: "error", message: "code not found" });
        } else {
          return res.status(200).json({ status: "error", message: "404" });
        }
      }
    })();
  } catch (e) {
    console.log(e);
  }
};
