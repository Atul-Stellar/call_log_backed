const sales_data = require("../../../models/sales_data");
const { Op } = require("sequelize");
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const { getLogin } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
exports.ckOrderAddressName = async()=>{
    try{
        let data = [];
        const get = await sales_data.ck_orders_address.findAll({
            include:{
                attributes:['id','docnum','docdate','docenter'],
                model:sales_data.ck_orders,
                as:"fk_ck_order"
            },
            where:{
                BillFromName:{
                    [Op.or]:['',null]
                }
            },
            limit:50,
        })

        if(get){
            if(get.length != 0){
                get.map((e)=>{
                    data.push({
                        docnum:e.fk_ck_order.docnum,
                        docdate:e.fk_ck_order.docdate,
                        addressid:e.id,
                        docentry:e.fk_ck_order.docenter,
                    })
                })
            }
        }
        if(data.length != 0){
            await updateData(data);
        }
        
    }catch(e){
        console.log(e);
    }
}

const updateData = async(data)=>{
    var saplogin = await redisClient.get("sap_login");
    if (saplogin) {
      var spToken = saplogin;
      let config = {
        headers: {
          Cookie: spToken,
        },
      };
      
      data.map(async(e)=>{
        console.log(e.docentry);
        const ress = await axios
        .get(process.env.sap_URL + "/Orders?$filter=DocEntry eq "+e.docentry+"", config)
        .catch((e) => console.log(e));
      if (ress) {
      const upd =    await sales_data.ck_orders_address.update({
            BillFromName:ress.data.value[0].PayToCode,
            BillToName:ress.data.value[0].ShipToCode
        },
        {
            where:{
                id:e.addressid
            }
        })
        if(upd){
            console.log("updated");
        }
      }
      })
    } else {
      getLogin();
      let link = "NA";
      InitCkOrder(link);
    }
}