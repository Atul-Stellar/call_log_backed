const sales_data = require("../../../models/sales_data");
const school = require("../../../models/school");
const { Op } = require("sequelize");
const axios = require("axios").default;
const https = require("https");
require("dotenv").config();
const redisClient = require("../../../config/redis.config");
const { getSapLoginToken, getSapAutoLogin, delSapToken } = require("../login.service");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
exports.syncSchoolEUPInvoice = async () => {
  let invs = await sales_data.ck_invoice.findAll({
    attributes: ["id", "docnum"],
    include: {
      attributes: ["id"],
      model: sales_data.ck_invoice_schools,
      as: "ck_invoice_schools",
      include: {
        attributes: ["id", "ck_code", "school_name"],
        model: school.school_master,
        as: "fk_school",
        where: { ck_code: { [Op.not]: "" } },
      },
    },
    limit: 4,
    where: {
      sap_status: {
        [Op.not]: true,
      },
    },
  });

  if (invs.length != 0) {
    syncSchoolEUPinv(invs);
  }
};

function syncSchoolEUPinv(invs) {
  (async () => {
    if (invs.length != 0) {
      await Promise.all(
        invs.map(async (e) => {
          console.log();
          let m = e.ck_invoice_schools;

          var saplogin = await redisClient.get("sap_login");
          if (saplogin) {
            try {
              var spToken = saplogin;
              let config = {
                headers: {
                  Cookie: spToken,
                },
              };
              let tempdata = {
                U_SCode: m[0].fk_school.ck_code,
                U_SName: m[0].fk_school.school_name,
              };
              let invURL = "Invoices(" + e.docnum + ")";
              console.log(invURL);
              axios
                .patch(process.env.sap_URL + "/" + invURL, tempdata, config)
                .then((data) => {
                  console.log("test");
                  console.log(data);
                  (async () => {
                    const updateT = await sales_data.ck_invoice.update(
                      {
                        sap_status: true,
                        u_sname: m[0].fk_school.school_name,
                        u_scode: m[0].fk_school.ck_code,
                      },
                      {
                        where: { docnum: e.docnum },
                      }
                    );
                    if (!updateT) {
                    }
                  })();
                })
                .catch((error) => {
                  console.log(error);
                  (async () => {
                    const updateT = await sales_data.ck_invoice.update(
                      {
                        sap_status: false,
                        sap_error: error.response,
                      },
                      {
                        where: { docnum: e.docnum },
                      }
                    );
                    if (!updateT) {
                      console.log("update  fails");
                    }
                  })();
                });
            } catch (e) {
              if (e.message === "Request failed with status code 401") {
                getLogin();
              }
            }
          }
        })
      );
    }
  })();
}


exports.getTotalInvCount = async ()=>{
  const config = getSapLoginToken();
  const ress =  await axios
  .get(
    process.env.sap_URL +
      "/CreditNotes?$select = DocEntry, DocNum & $filter=CreationDate ge '2021-01-01' and CreationDate le '2023-02-01' and CardCode eq 'CBP000164'",
    config
  )
  .catch(async(e) => {
    if(e.message == "Request failed with status code 401"){
      console.log("relogin sap")
     let del =  await delSapToken();
     if(del.status == "success"){
      await getSapLoginToken()
      this.getTotalInvCount();
     }
    }
  });
  if(ress){
    let newLink = Object.values(ress.data)[0];
    let data = ress.data;
    console.log(newLink)
    return data.length;
  }

}
