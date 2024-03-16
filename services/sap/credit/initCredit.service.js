require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const {  getSapLoginToken, getSapAutoLogin } = require("../login.service");
const sales_data = require("../../../models/sales_data");
const users = require("../../../models/users");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

axios.defaults.httpsAgent = agent;

const InitCreditMaster =async(link)=>{
  let config = await getSapLoginToken()
        if (link === "NA") {
          const ress = await axios
          .get(
            process.env.sap_URL +
              "/CreditNotes?$select=DocEntry,SalesPersonCode,DocNum,DocDate,CardCode,U_Boxes,GSTTransactionType,CardName,DocTotal&$filter=CreationDate%20gt%202022-04-01",
            config
          )
            .catch(async(e) => {console.log(e.message);if(e.message == 'Request failed with status code 401'){await getSapAutoLogin()}});
          if (ress) {
            let newLink = Object.values(ress.data)[2];
            let data = ress.data;

            await allSync(data, newLink,config);
          }
        } else if (link && link !== "NA") {
          const ress = await axios
            .get(process.env.sap_URL + "/"+link, config)
            .catch((e) => {console.log(e.message);});
          if (ress) {
            let newLink = Object.values(ress.data)[2];
            let data = ress.data;
            await allSync(data, newLink,config);
          }
        }
}


const allSync = async (data, link) => {
  let datas = data.value;
  await Promise.all(
    datas.map(async (e) => {
      const isExist = await sales_data.all_credits.count({
          where:{
              docentery:e.DocEntry,
              docnum:e.DocNum
          }
      })
      if(isExist === 0){
          let user_id = await users.user_master.findOne({
              attributes:['id'],
              where: { SalesPersonCode: e.SalesPersonCode },
            });
            if(user_id){
               await sales_data.all_credits.create({
                docentery:e.DocEntry,
                docnum:e.DocNum,
                docdate: new Date(e.DocDate),
                cardcode:e.CardCode,
                cardname:e.CardName,
                doctotal:e.DocTotal,
                boxes:e.U_Boxes,
                fk_user_id:user_id.id
              })
            } 
      }
      
     
  })
  );
  if (link != "") {
    InitCreditMaster(link);
  }else{
      console.log("done!")
  }
 
};

module.exports = InitCreditMaster;