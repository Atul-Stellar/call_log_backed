require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const {
  getInvNumber,
} = require("../../../controllers/api/doc_print/invoice.controller");
const sales_data = require("../../../models/sales_data");
const users = require("../../../models/users");
const { getItemInfoSap } = require("../ItemMaster/getItemInfo.service");
const { getLogin, getSapLoginToken, getSapAutoLogin } = require("../login.service");
const { getItemDetailFromAzure } = require("../../azure_sync/item.service");
const { getInvoiceSo_No } = require("../../azure_sync/invoice.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const InitEUPInv = async (link) => {
  let config = await getSapLoginToken()
  

        if (link === "NA") {
          const ress = await axios
            .get(
              process.env.sap_URL +
                "/Invoices?$select=DocEntry,SalesPersonCode,DocNum,DocDate,CardCode,U_Boxes,GSTTransactionType,U_SCode,U_SName,CardName,DocTotal,DocumentLines,EWayBillDetails&$filter=CreationDate%20gt%202022-04-01",
              config
            )
            .catch(async(e) => {console.log(e.message);if(e.message == 'Request failed with status code 401'){await getSapAutoLogin()}});
          if (ress) {
            let newLink = Object.values(ress.data)[2];
            let data = ress.data;

            await allSync(data, newLink,config);
          }
        } else if (link && link !== "NA") {
          console.log("test")
          const ress = await axios
            .get(process.env.sap_URL + "/"+link, config)
            .catch((e) => {console.log(e.message);});
          if (ress) {
            let newLink = Object.values(ress.data)[2];
            let data = ress.data;
            await allSync(data, newLink,config);
          }
        }
  
};

const allSync = async (data, link,token) => {
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

     
          var invType = "ck";
          if(ckItemSts == false){
            invType = "eupheus"
          }
          const ckInv = await sales_data.eup_invoice.count({
            where: { docentery: e.DocEntry },
          });
          let getInvNo = await getInvNumber(e.DocNum, e.DocDate);
          let so_no = await getInvoiceSo_No(e.DocNum, e.DocDate);
          let snumber = 0;
          if(so_no.message.length != 0){
            snumber = so_no?.message[0]?.SO_No;
            if(snumber == undefined || snumber == null){
              snumber=0;
            }
          }
          
          let invNumer = null;
          let invTypes = null;
          if(getInvNo && getInvNo.length != 0){
            invNumer = getInvNo.message.message.inv_no;
            invTypes = getInvNo.message.message.invType;
          }
          if (
            ckInv == 0 
           
          ) {
            let user_id = await users.user_master.findOne({
              attributes: ["id"],
              where: { SalesPersonCode: e.SalesPersonCode },
            });
            if (user_id) {
              const createInv = await sales_data.eup_invoice.create({
                docnum: e.DocNum,
                docdate: e.DocDate,
                cardcode: e.CardCode,
                cardname: e.CardName,
                doctotal: e.DocTotal,
                u_sname: e.U_SName,
                u_scode: e.U_SCode,
                docentery: e.DocEntry,
                fk_user_id: user_id.id,
                gsttransactiontype: e.GSTTransactionType,
                inv_no:invNumer ,
                inv_type:invTypes,
                boxes: e.U_Boxes,
                invtype:invType,
                so_no:snumber
              });
              if (createInv) {
                if (e.hasOwnProperty("EWayBillDetails")) {
                  let eb = e.EWayBillDetails;

                  await sales_data.eup_invoice_address.create({
                    fk_eup_invoice_id: createInv.id,
                    BillFromName: eb.BillFromName,
                    DispatchFromAddress1: eb.DispatchFromAddress1,
                    BillToName: eb.BillToName,
                    ShipToAddress1: eb.ShipToAddress1,
                  });
                }
                if (e.hasOwnProperty("DocumentLines")) {
                  let md = e.DocumentLines;
                  if (md.length != 0) {
                    await Promise.all(
                      md.map(async (m) => {
                      const getItem = await getItemDetailFromAzure(m.ItemCode)
                      
                      if(getItem && getItem.length !=0){
                        var gr = '';
                        var sr = '';
                        if(getItem.message[0].U_Grade == null){
                          gr = "N/A"
                        }
                        else if(getItem.message[0].U_Grade == undefined){
                          gr = "N/A"
                        }else{
                          gr = getItem.message[0].U_Grade 
                        }
                        if(getItem.message[0].U_Series == null){
                          sr = "N/A"
                        }
                        else if(getItem.message[0].U_Series == undefined){
                          sr = "N/A"
                        }else{
                          sr = getItem.message[0].U_Series 
                        }
                        
                          await sales_data.eup_invoice_items.create(
                            {
                                fk_eup_invoice_id: createInv.id,
                                itemcode: m.ItemCode,
                                itemdescription: m.ItemDescription,
                                quantity: m.Quantity,
                                price: m.Price,
                                discountpercent: m.DiscountPercent,
                                subject:getItem.message[0].U_Subject,
                                series:sr,
                                grade:gr
                              }
                          );
                        }
                     
                       
                      })
                    );
                  }
                
                }
              }
            }
          }
        
      
    })
  );
  if (link != "") {
    console.log(link)
    InitEUPInv(link);
  }
  let message = "done";
  return message;
};

module.exports = InitEUPInv;
