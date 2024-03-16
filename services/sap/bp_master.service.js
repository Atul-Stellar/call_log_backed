const axios = require("axios").default;
const https = require("https");
var cron = require("node-cron");
var public = require("../../models/public");
var school = require("../../models/school");
var sales_data = require("../../models/sales_data");
const users = require("../../models/users");
const redisClient = require("../../config/redis.config");
const {
  SapOrder_failed,
  SapOrder_process,
} = require("../../config/log.config");
const syncUsers = require("./userMaster/masterUser.service");
const syncItems = require("./ItemMaster/masterItem.service");
const syncBps = require("./bpMaster/masterbp.service");
const { getLogin } = require("./login.service");
const { syncQueues } = require("../../config/sync_jobs.config");
const endDayAuto = require("../hr_one/endDay.service");
const syncHrOne = require("../hr_one/syncHrOne.service");
const InitCkInv = require("./ckInvoices/initCkInv");
const syncCkInv = require("./ckInvoices/masterCkInv");
const syncEUPInv = require("./eupInvoice/masterEupInv");
const { AutoDeleteCKInv } = require("./ckInvoices/autoDeleteInv.service");
const { AutoDeleteEUPInv } = require("./eupInvoice/autoDeleteInv.service");
const { syncSchoolCkInvoice } = require("./ckInvoices/invoice.service");
const { autoSyncCkInvNumber, UpdateCKNAInvNo } = require("./ckInvoices/autoSyncInvNumber.service");
const { autoSyncEupInvNumber, UpdateEUPNAInvNo, findNullItemDetailEupInvSap, ResyncEupInvData, EupInvSoNo } = require("./eupInvoice/autoSyncEupInvNo.service");
const { ckLogin } = require("../CK/ck_login.service");
const { ckOrderAddressName } = require("./ckOrder/ckOrderAutoUpdates.service");
const { syncSchoolCkOrders } = require("./ckOrder/ckOrderSchool.service");
const { EUPINVTAGCSV } = require("../EUP/eupInvTagCSV.service");
const { getAddressEupInv } = require("./eupInvoice/autoAddressInv.service");
const syncCreditMaster = require("./credit/creditMaster.service");

cron.schedule(" 0 */25 * * * *", function () {
  (async () => {
    var saplogin = await redisClient.get("sap_login");
    if (saplogin) {
      await redisClient.del(saplogin);
      getLogin();
    }
    var ckLogins = await redisClient.get('ck_login');
    if(ckLogins){
      await redisClient.del(ckLogins)
     await ckLogin();
    }
  })();
});
cron.schedule("0 */15 * * * *", function () {
  (async () => {
    var saplogin = await redisClient.get("sap_login");
    if (saplogin) {
      syncQueues
        .createJob(getOrders())
        .setId("syncSalesQuatation")
        .save((err, job) => {
          console.log("SQ sync");
        });
    }
  })();
});
cron.schedule("0 */720 * * * *", function () {
  (async () => {
    var saplogin = await redisClient.get("sap_login");
    if (saplogin) {
      
      syncQueues
        .createJob(syncItems())
        .setId("syncItems")
        .save((err, job) => {
          console.log("Items sync");
        });
        syncQueues
        .createJob(syncCreditMaster())
        .setId("syncItems")
        .save((err, job) => {
          console.log("Items sync");
        });
      syncQueues
        .createJob(syncBps())
        .setId("syncBps")
        .save((err, job) => {
          console.log("Bps sync");
        });
        // syncQueues
        // .createJob(syncEUPInv())
        // .setId("syncEupInvoices")
        // .save((err, job) => {
        //   console.log("eupheus invoice sync");
        // });
        syncQueues
        .createJob(UpdateCKNAInvNo())
        .setId("UpdateCKNAInvNo")
        .save((err, job) => {
          console.log("UpdateCKNAInvNo");
        });
        syncQueues
        .createJob(UpdateEUPNAInvNo())
        .setId("UpdateEUPNAInvNo")
        .save((err, job) => {
          console.log("UpdateEUPNAInvNo");
        });
    } else {
      getLogin();
    }
  })();
});

cron.schedule("0 */60 * * * *", function () {
  (async () => {
    var saplogin = await redisClient.get("sap_login");
    syncQueues
        .createJob(syncUsers())
        .setId("syncUsers")
        .save((err, job) => {
          console.log("Uses sync");
        });
    if (saplogin) {
      syncQueues
      .createJob( findNullItemDetailEupInvSap())
      .setId(" findNullItemDetailEupInvSap")
      .save((err, job) => {
        console.log(" findNullItemDetailEupInvSap()");
      });
     
      syncQueues
        .createJob(syncCkInv())
        .setId("syncInvoices")
        .save((err, job) => {
          console.log("cki nvoice sync");
        });
      syncQueues
        .createJob(syncSchoolCkInvoice())
        .setId("syncInvoicesOnSAP")
        .save((err, job) => {
          console.log("ck invoice update on SAP");
        });
      
        syncQueues
        .createJob(syncSchoolCkOrders())
        .setId("syncCKSCjool")
        .save((err, job) => {
          console.log("syncSchoolCkOrders");
        });
    } else {
      getLogin();
    }
  })();
});

// cron.schedule("0 */8 * * * *", function () {
//   (async () => {
//     var saplogin = await redisClient.get("sap_login");
//     if (saplogin) {
//       syncQueues
//         .createJob(EupInvSoNo())
//         .setId("EupInvSoNo")
//         .save((err, job) => {
//           console.log("EupInvSoNo");
//         });
//     }
//   })();
// });

// cron.schedule("0 */3 * * * *", function () {
//   (async () => {
//     var saplogin = await redisClient.get("sap_login");
//     if (saplogin) {


//       syncQueues
//       .createJob( findNullItemDetailEupInvSap())
//       .setId(" findNullItemDetailEupInvSap")
//       .save((err, job) => {
//         console.log(" findNullItemDetailEupInvSap()");
//       });

//       // syncQueues
//       //         .createJob(EUPINVTAGCSV())
//       //         .setId("EUPINVTAGCSV")
//       //         .save((err, job) => {
//       //           console.log("EUPINVTAGCSV");
//       //         });
//       // syncQueues
//       //   .createJob(getAddressEupInv())
//       //   .setId("getAddressEupInv")
//       //   .save((err, job) => {
//       //     console.log("getAddressEupInv");
//       //   });
//         // syncQueues
//         // .createJob(ResyncEupInvData())
//         // .setId("ResyncEupInvData")
//         // .save((err, job) => {
//         //   console.log("ResyncEupInvData");
//         // });
        
//     } else {
//       getLogin();
//     }
//   })();
// });
// cron.schedule("0 */20 * * * *", function () {
//   (async () => {
//     var saplogin = await redisClient.get("sap_login");
//     if (saplogin) {
//       syncQueues
//         .createJob(ckOrderAddressName())
//         .setId("autoCKAddressName")
//         .save((err, job) => {
//           console.log("ckOrderAddressName");
//         });
//         //  syncQueues
//         // .createJob(getAddressEupInv())
//         // .setId("getAddressEupInv")
//         // .save((err, job) => {
//         //   console.log("getAddressEupInv");
//         // });
        
//     } else {
//       getLogin();
//     }
//   })();
// });

cron.schedule("38 23 * * *", function () {
  (async () => {
    await endDayAuto();
  })();
});

cron.schedule("0 */180 * * * *", function () {
  (async()=>{
    await syncHrOne()

})()
});

// cron.schedule("00 30 23 * * 0-7", function () {

//   (async(req,res)=>{
//     const getLastSchool = await public.school_punch.findOne({
//       where:{fk_user_id:req.userId,category:'out'},
//       order: [
//         ['createdAt', 'DESC'],
//     ]
//     });
//     if(getLastSchool){
//       const getUserEnd = await public.user_day.findOne({
//         where:{fk_user_id:req.userId,category:'end'},
//         order: [
//           ['createdAt', 'DESC'],
//       ]
//       })
//       let date = getLastSchool.updateAt;
//       console.log(date)
//     }
//   })();
// })

exports.getEventTest = async (req, res) => {
  try {
    InitCkInv();
  } catch (e) {
    return res.status(200).send({ status: "error", message: e.message });
  }
};

var session = {
  data: [],
};
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const getOrders = () => {
  let orders = public.order_processing;
  orders
    .findAll({
      attributes: ["id"],
      where: { sap_status: false },
      limit: 150,
    })
    .then((orders) => {
      if (orders.length != 0) {
        orders.map((i) => {
          cronSqPush(i.id);
        });
      }
    });
};

exports.OrdersByForce = () => {
  let orders = public.order_processing;
  orders
    .findAll({
      attributes: ["id"],
      where: [
        { sap_status: false },
        {
          sap_faileur: 0,
        },
      ],
      limit: 150,
    })
    .then((orders) => {
      if (orders.length != 0) {
        orders.map((i) => {
          cronSqPush(i.id);
        });
      } else {
        console.log("All order up to date");
      }
    });
};

const cronSqPush = (req, res) => {
  let getList = public.order_processing;
  getList
    .findAll({
      attributes: ["order_ref", "transporter_name", "delivery_date", "remarks"],
      include: [
        {
          attributes: ["school_name", "scode"],
          model: school.school_master,
          as: "fk_school",
        },
        {
          attributes: ["name"],
          model: public.pref_transporters,
          as: "transporter_name_pref_transporter",
        },
        {
          attributes: ["bp_code", "bp_name"],
          model: sales_data.bp_master,
          as: "fk_bp",
        },
        {
          attributes: ["sap_id", "first_name", "SalesPersonCode"],
          model: users.user_master,
          as: "fk_user",
        },

        {
          attributes: ["category"],
          model: public.order_processing_address,
          as: "order_processing_addresses",
          include: {
            attributes: ["address", "fk_state_id"],
            model: sales_data.bp_address,
            as: "fk_addressq",
            order: [["category", "ASC"]],
          },
        },
        {
          attributes: ["quantity", "tax", "discount"],
          model: public.order_processing_items,
          as: "order_processing_items",
          include: {
            attributes: ["item_code", "price"],
            model: public.item_master,
            as: "fk_item",
          },
        },
        {
          attributes: ["bp_contact_code"],
          model: sales_data.bp_contact,
          as: "bp_contact",
        },
      ],
      where: [
        {
          sap_status: false,
        },
        {
          sap_faileur: 0,
        },
        {
          id: req,
        },
      ],
    })
    .then((getList) => {
      if (getList.length != 0) {
        const sapItems = getList.map((i) => {
          let shipAddress = "";
          let BillAddress = "";
          let taxCode = "";
          i.order_processing_addresses.map((address) => {
            if (address.fk_addressq != null) {
              if (address.fk_addressq.address != null) {
                if (address.category === "S") {
                  if (address.fk_addressq.address != "") {
                    shipAddress = address.fk_addressq.address;
                  }
                } else if (address.category === "B") {
                  if (address.fk_addressq.address != "") {
                    BillAddress = address.fk_addressq.address;
                    if (
                      address.fk_addressq.fk_state_id ==
                      "97b917c5-09ca-458c-a24e-5f3f30b825fd"
                    ) {
                      taxCode = "SG+CG";
                    } else {
                      taxCode = "IGST";
                    }
                  }
                }
              }
            }
          });

          var itm = {
            DocumentLines: [],
          };
          i.order_processing_items.map((e) => {
            itm.DocumentLines.push({
              ItemCode: e.fk_item.item_code,
              Quantity: e.quantity,
              TaxCode: taxCode + "_" + e.tax,
              TaxPercentagePerRow: e.tax,
              DiscountPercent: e.discount,
              UnitPrice: e.fk_item.price,
            });
          });
          let tempCot;
          if (i.bp_contact != null) {
            tempCot = i.bp_contact.bp_contact_code;
          } else {
            tempCot = null;
          }

          let schoolcodes = "NA";
          let schhoolNames = "NA";
          if (i.fk_school != null) {
            if (i.fk_school.school_name != "") {
              schhoolNames = i.fk_school.school_name;
              schoolcodes = JSON.stringify(i.fk_school)
                .split(",")[1]
                .split(":")[1]
                .split('"')[1];
            }
          }

          if (i.fk_bp != null && shipAddress != "" && BillAddress != "") {
            let tempdata = {
              CardCode: i.fk_bp.bp_code,
              Comments: i.remarks,
              NumAtCard: i.order_ref,
              ShipDate: i.delivery_date,
              ContactPersonCode: tempCot,
              CardName: i.fk_bp.bp_name,
              ShipToCode: shipAddress,
              PayToCode: BillAddress,
              U_SCode: schoolcodes,
              U_SName: schhoolNames,
              BPL_IDAssignedToInvoice: 3,
              SalesPersonCode: i.fk_user.SalesPersonCode,
              U_UNE_TRANSP_NAME: i.transporter_name_pref_transporter.name,
              DocumentLines: itm.DocumentLines,
              DocumentsOwner: i.fk_user.sap_owner_code,
            };
            SapOrder_process.error(tempdata);
            (async () => {
              var saplogin = await redisClient.get("sap_login");
              if (saplogin) {
                try {
                  var spToken = saplogin;
                  let config = {
                    headers: {
                      Cookie: spToken,
                    },
                  };

                  axios
                    .post(process.env.sap_URL + "/Quotations", tempdata, config)
                    .then((data) => {
                      let ups = public.order_processing;
                      ups
                        .update(
                          {
                            sap_status: true,
                            docentry: data.data.DocEntry,
                            docnum: data.data.DocNum,
                          },
                          {
                            where: { id: req },
                          }
                        )
                        .then((ups) => {
                          if (ups) {
                            console.log("complete order updated ");
                          } else {
                            console.log("complete order not updated");
                          }
                        });
                      console.log("com complete order updated ");
                    })
                    .catch((error) => {
                      session.data.push(error.response.data);
                      session.data.push(tempdata);
                      console.log(error.response.data);
                      var json = JSON.stringify(session);
                      // SapOrder.error(session);
                      SapOrder_failed.error(session);

                      let up = public.order_processing;
                      up.update(
                        {
                          sap_status: true,
                          sap_faileur: 1,
                          failed: json,
                        },
                        {
                          where: { id: req },
                        }
                      ).then((up) => {
                        if (up) {
                          console.log("error order updated");
                        } else {
                          console.log("error order not updated");
                        }
                      });
                    });
                } catch (e) {
                  if (e.message === "Request failed with status code 401") {
                    getLogin();
                  }
                }
              }
            })();
          } else {
            let up = public.order_processing;
            up.update(
              {
                sap_status: true,
                sap_faileur: 1,
                failed: "BP code/address error",
              },
              {
                where: { id: req },
              }
            ).then((up) => {
              if (up) {
                console.log("error bp error updated");
              } else {
                console.log("error bp error");
              }
            });
          }
        });
      }
    });
  return { status: "success", message: "order posted on sap" };
};