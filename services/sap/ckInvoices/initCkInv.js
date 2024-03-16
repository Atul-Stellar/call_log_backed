require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const {
  getInvNumber,
} = require("../../../controllers/api/doc_print/invoice.controller");
const sales_data = require("../../../models/sales_data");
const { getInvoiceNumber } = require("../../azure_sync/invoice.service");
const { getLogin, getSapLoginToken } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const InitCkInv = async (link) => {
  let config = getSapLoginToken();
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
            await allSync(data, newLink);
          }
        } else if (link && link !== "NA") {
          const ress = await axios
            .get(process.env.sap_URL + "/"+link, config)
            .catch((e) => console.log(e.message));
          if (ress) {
            let newLink = Object.values(ress.data)[2];
            let data = ress.data;
            await allSync(data, newLink);
          }
        }
  
};

const allSync = async (data, link) => {
  console.log(link);
  let datas = data.value;
  await Promise.all(
    datas.map(async (e) => {
      let sts = false;
      if (e.hasOwnProperty("DocumentLines")) {
        let md = e.DocumentLines;
        if (md.length != 0) {
          // console.log("up");
          sts = await Promise.all(
            md.map(async (m) => {
              let itmCode = m.ItemCode;
              if (itmCode.substring(0, 3) == "CLK") {
                return true;
              }
              return false;
            })
          );
        }
      }

      let sts1 = sts.toString();
      let ckItemSts = sts1.includes("true");
      let invNumber = await getInvoiceNumber(e.DocNum,e.DocDate);
      if (ckItemSts == true) {
        const ckInv = await sales_data.ck_invoice.count({
          where: { docenter: e.DocEntry },
        });
        if (ckInv == 0) {
          const createInv = await sales_data.ck_invoice.create({
            docnum: e.DocNum,
            docdate: e.DocDate,
            cardcode: e.CardCode,
            cardname: e.CardName,
            doctotal: e.DocTotal,
            u_sname: e.U_SName,
            u_scode: e.U_SCode,
            docenter: e.DocEntry,
            inv_no: invNumber.inv_no,
          });
          if (createInv) {
            if (e.hasOwnProperty("EWayBillDetails")) {
              let eb = e.EWayBillDetails;

              await sales_data.ck_invoice_address.create({
                fk_ck_invoice_id: createInv.id,
                BillFromName: eb.BillFromName,
                DispatchFromAddress1: eb.DispatchFromAddress1,
                BillToName: eb.BillToName,
                ShipToAddress1: eb.ShipToAddress1,
              });
            }
            if (e.hasOwnProperty("DocumentLines")) {
              let data = [];
              let md = e.DocumentLines;
              if (md.length != 0) {
                await Promise.all(
                  md.map(async (m) => {
                    //  await sales_data.ck_invoice_address.create({
                    //     fk_ck_invoice_id:createInv.id,
                    //     BillFromName:f.BillFromName,
                    //     DispatchFromAddress1:f.DispatchFromAddress1,
                    //     BillToName:f.BillToName,
                    //     ShipToAddress1:f.ShipToAddress1
                    // })
                    data.push({
                      fk_ck_invoice_id: createInv.id,
                      itemcode: m.ItemCode,
                      itemdescription: m.ItemDescription,
                      quantity: m.Quantity,
                      price: m.Price,
                      discountpercent: m.DiscountPercent,
                    });
                  })
                );
              }
              if (data.length != 0) {
                await sales_data.ck_invoice_items.bulkCreate(data);
              }
            }
          }
        }
      }
    })
  );
  if (link != "") {
    InitCkInv(link);
  }
  let message = "done";
  return message;
};

module.exports = InitCkInv;
