require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const sales_data = require("../../../models/sales_data");
const { getLogin, getSapLoginToken } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const InitCkOrder =async (link) => {
  let config = await getSapLoginToken()
 
        if (link === "NA") {
          const ress = await axios
            .get(
              process.env.sap_URL +
                "/Orders?$select=DocEntry,DocDate,CardCode,U_SCode,U_SName,CardName,DocTotal,DocNum,DocumentLines,Address2,Address&$filter=CreationDate%20gt%202022-10-01",
              config
            )
            .catch((e) => console.log(e));
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
      if (ckItemSts == true) {
        const ckInv = await sales_data.ck_orders.count({
          where: { docenter: e.DocEntry },
        });
        if (ckInv == 0) {
          const createInv = await sales_data.ck_orders.create({
            docnum: e.DocNum,
            docdate: e.DocDate,
            cardcode: e.CardCode,
            cardname: e.CardName,
            doctotal: e.DocTotal,
            u_sname: e.U_SName,
            u_scode: e.U_SCode,
            docenter: e.DocEntry,
            inv_no: "NA",
          });
          if (createInv) {
            await sales_data.ck_orders_address.create({
              fk_ck_orders_id: createInv.id,
              BillFromName: e.PayToCode,
              DispatchFromAddress1: e.Address,
              BillToName: e.ShipToCode,
              ShipToAddress1: e.Address2,
            });
            if (e.hasOwnProperty("DocumentLines")) {
              let data = [];
              let md = e.DocumentLines;
              if (md.length != 0) {
                await Promise.all(
                  md.map(async (m) => {
                    //  await sales_data.ck_invoice_address.create({
                    //     fk_ck_orders_id:createInv.id,
                    //     BillFromName:f.BillFromName,
                    //     DispatchFromAddress1:f.DispatchFromAddress1,
                    //     BillToName:f.BillToName,
                    //     ShipToAddress1:f.ShipToAddress1
                    // })
                    data.push({
                      fk_ck_orders_id: createInv.id,
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
                await sales_data.ck_orders_items.bulkCreate(data);
              }
            }
          }
        }
      }
    })
  );
  if (link != "") {
    InitCkOrder(link);
  }
  let message = "done";
  return message;
};

module.exports = InitCkOrder;
