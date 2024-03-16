const sales_data = require("../../../models/sales_data");
const school = require("../../../models/school");
const { Op } = require("sequelize");
const axios = require("axios").default;
const https = require("https");
require("dotenv").config();
const redisClient = require("../../../config/redis.config");
const { getSapLoginToken } = require("../login.service");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
exports.syncSchoolCkOrders = async () => {
  let invs = await sales_data.ck_orders.findAll({
    attributes: ["id", "docenter"],
    include: {
      attributes: ["id"],
      model: sales_data.ck_orders_schools,
      as: "ck_orders_schools",
      include: {
        attributes: ["id", "ck_code", "school_name"],
        model: school.school_master,
        as: "fk_school",
        where: { ck_code: { [Op.not]: null } },
      },
    },
    limit: 100,
    where: {
      sap_status: {
        [Op.not]: true,
      },
    },
  });
  // console.log(invs)
  if (invs.length != 0) {
    console.log(invs.length);
    syncSchoolCkOrder(invs);
  }
};

function syncSchoolCkOrder(invs) {
  (async () => {
    if (invs.length != 0) {
      await Promise.all(
        invs.map(async (e) => {
          let m = e.ck_invoice_schools;
          let config  = await getSapLoginToken()
             
              let tempdata = {
                U_SCode: m[0].fk_school.ck_code,
                U_SName: m[0].fk_school.school_name,
              };
              console.log(tempdata);
              let invURL = "/Orders(" + e.docenter + ")";
              console.log(invURL);
              axios
                .patch(process.env.sap_URL + invURL, tempdata, config)
                .then((data) => {
                  if (data) {
                    console.log("invoice updated");
                  }
                  (async () => {
                    const updateT = await sales_data.ck_orders.update(
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
            
          
        })
      );
    }
  })();
}
