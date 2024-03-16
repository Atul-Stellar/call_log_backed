require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const { syncJobssLog } = require("../../../config/log.config");
const users = require("../../../models/users");
const { getLogin, getSapLoginToken } = require("../login.service");
const { Op } = require("sequelize");
const { SymcPassword } = require("../../../controllers/auth.controller");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const InitUserMaster = async (link) => {
  let config = await getSapLoginToken()


          if (link === "NA") {
            await users.user_master.update(
              {
                last_update: "N",
              },
              {
                where: { emp_id: { [Op.notLike]: "%ASK%" },
                          fk_category_id:{
                            [Op.notIn]:['3efaa523-8706-4523-b10b-064be8814f51']
                          }
              },
              }
            );
            const ress = await axios
              .get(process.env.sap_URL + "/EmployeesInfo", config)
              .catch((e) => console.log(e));
            if (ress) {
              let newLink = Object.values(ress.data)[2];
              let data = ress.data;
              await allSync(data, newLink);
            }
          } else if (link && link !== "NA") {
            setTimeout(async () => {
              const ress = await axios
                .get(process.env.sap_URL + "/"+link, config)
                .catch((e) => console.log(e));
              if (ress) {
                let newLinks = Object.values(ress.data)[2];
                let data = ress.data;
                await allSync(data, newLinks);
              }
            }, 2000);
          }
   
};

const getSapUserDetail =async (spc) => {
  let config = await getSapLoginToken()
  const ress = await axios
  .get(process.env.sap_URL + "/EmployeesInfo?$filter=EmployeeID eq "+spc, config)
  .catch((e) => console.log(e.message));
    if (ress) {
      let data = ress.data;
      if(data.value.length != 0){
        return data.value[0].JobTitle

      }
      return "NA";
      // await syncManger(data,);
    }
}


const allSync = async (data, link) => {
  if (data !== undefined) {
    let datas = data.value;
    await Promise.all(
      datas.map(async (e) => {
        if (
          e.Active == "tYES" &&
          e.JobTitle != "" &&
          e.JobTitle != undefined &&
          e.SalesPersonCode != "" &&
          e.SalesPersonCode != undefined
        ) {
          try {
            const getUser = await users.user_master.findOne({
              where: { emp_id: e.JobTitle },
            });
            let getZSMID = await getSapUserDetail(e.U_zsmno);
            let getManagerID = await getSapUserDetail(e.Manager);
            if (!getUser) {
              const createUser = await users.user_master.create({
                first_name: e.FirstName,
                middle_name: e.MiddleName,
                last_name: e.LastName,
                email: e.eMail,
                emp_id: e.JobTitle,
                status: true,
                fk_category_id: "9d6307d3-4527-45c6-8023-94351754e27b",
                fk_user_company_id:"78788e68-a6d6-447a-b844-994fdf7b19e6",
                sap_id: e.EmployeeID,
                SalesPersonCode: e.SalesPersonCode,
                sap_emp_code: e.Manager,
                manager: getManagerID,
                last_update: "Y",
                zsm:getZSMID
              });
              if (!createUser) {
              }
            } else { 
              const updateUser = await users.user_master.update(
                {
                  first_name: e.FirstName,
                  middle_name: e.MiddleName,
                  last_name: e.LastName,
                  sap_id: e.EmployeeID,
                  email: e.eMail,
                  SalesPersonCode: e.SalesPersonCode,
                  sap_emp_code: e.Manager,
                  manager: getManagerID,
                last_update: "Y",
                zsm:getZSMID,
                  status: true
                  
                },
                {
                  where: { emp_id: e.JobTitle },
                }
              );
              if (!updateUser) {
              }
            }
          } catch (e) {
            console.log(e);
            syncJobssLog.error({
              from: "userSync",
              message: e.message,
              time: Date.now(),
            });
            if (e.message == "Request failed with status code 401") {
              getLogin();
              let link = "NA";
              InitItemMaster(link);
            }
            console.log(e.message);
          }
        }
      })
    );

    if (link) {
      InitUserMaster(link);
    } else {
      await users.user_master.update(
        { status: false },
        { where: { last_update: "N" } }
      );

      await SymcPassword();

    }
    let message = "done";
    return message;
  }
};
module.exports = InitUserMaster;
