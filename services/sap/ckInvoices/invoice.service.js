const sales_data = require("../../../models/sales_data");
const school = require("../../../models/school");
const { Op } = require("sequelize");
const axios = require("axios").default;
const https = require("https");
require("dotenv").config();
const redisClient = require("../../../config/redis.config");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
exports.syncSchoolCkInvoice = async () => {
  let invs = await sales_data.ck_invoice.findAll({
    attributes: ["id", "docenter"],
    include: {
      attributes: ["id"],
      model: sales_data.ck_invoice_schools,
      as: "ck_invoice_schools",
      include: {
        attributes: ["id", "ck_code", "school_name"],
        model: school.school_master,
        as: "fk_school",
        where: { ck_code: { [Op.not]: null } },
      },
    },
    limit: 50,
    where: {
      sap_status: {
        [Op.not]: true,
      },
    },
  });
  // console.log(invs)
  if (invs.length != 0) {
    console.log(invs.length);
    syncSchoolCkinv(invs);
  }
};

function syncSchoolCkinv(invs) {
  (async () => {
    if (invs.length != 0) {
      await Promise.all(
        invs.map(async (e) => {
          let m = e.ck_invoice_schools;
          var saplogin = await redisClient.get("sap_login");
          if (saplogin) {
            try {
              console.log("inside sap login ");
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
              console.log(tempdata);
              let invURL = "/Invoices(" + e.docenter + ")";
              console.log(invURL);
              axios
                .patch(process.env.sap_URL + invURL, tempdata, config)
                .then((data) => {
                  if (data) {
                    console.log("invoice updated");
                  }
                  (async () => {
                    const updateT = await sales_data.ck_invoice.update(
                      {
                        sap_status: true,
                        u_sname: m[0].fk_school.school_name,
                        u_scode: m[0].fk_school.ck_code,
                      },
                      {
                        where: { docenter: e.docenter },
                      }
                    );
                    if (!updateT) {
                      console.log("error while update ck invoice");
                    }
                    console.log("invoice ck updated");
                  })();
                })
                .catch((error) => {
                 
                  (async () => {
                    let rr= "";
                    if(error.response.data.error.message){
                      rr = error.response.data.error.message.value
                    }else {
                      rr =  "failed";
                    }
                    const updateT = await sales_data.ck_invoice.update(
                      {
                        sap_status: false,
                        sap_error: rr
                      },
                      {
                        where: { docenter: e.docenter },
                      }
                    );
                    if (!updateT) {
                      console.log("  fails");
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
