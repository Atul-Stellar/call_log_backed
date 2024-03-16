const sales_data = require("../../../models/sales_data");
var moment = require('moment');
const users = require("../../../models/users");
const locations = require("../../../models/locations");
const axios = require("axios").default;
const https = require("https");
const { getSapLoginToken } = require("../login.service");
require("dotenv").config();

const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  axios.defaults.httpsAgent = agent;



exports.createAOFSAP = async (accountId)=>{
    try{
        const getData = await sales_data.aof_master.findOne({
            include:[
                {
                    attributes:['id','SalesPersonCode'],
                    model:users.user_master,
                    as:"created_by_user_master"
                },
                {
                    attributes:['id','state','code'],
                    model:locations.state_master,
                    as:"fk_state"
                },
                {
                    attributes:['id','city'],
                    model:locations.city_master,
                    as:"fk_city"
                }
            ],
            where:{id:accountId}
        })
        if(!getData){
            return ({status:"error",message:"No Data found"});
        }

        let name = "null";
        if(getData.type == 'school'){
            let breakeName = getData.name.split("-");
            name = "(S) "+breakeName[0]
        }else{
            name = getData.name
        }

        let y = moment(getData.date,'YYYY-MM-DD').format('YYYY');
        let endDate =y+'-03-31';
        let creatData = {
            CardName:name,
            CardType: "cCustomer",
            Series: 165,
            GroupCode: 103,
            Address:getData.address,
            BillToState:getData.fk_state.code,
            ShipToState:getData.fk_state.code,
            ZipCode:getData.zip_code,
            Phone1:getData.mobile,
            ContactPerson:name,
            PriceListNum:6,
            SalesPersonCode:getData.created_by_user_master.SalesPersonCode,
            City:getData.fk_city.city,
            County:"India",
            Country: "IN",
            EmailAddress:getData.email,
            ValidFrom:getData.date,
            ValidTo:moment(endDate).add(2, 'year').format('YYYY-MM-DD'),
            CreditLimit:getData.credit_limit,
            BPAddresses:[
                {
                    AddressName:name,
                    Block:getData.address,
                    ZipCode:getData.zip_code,
                    City:getData.fk_city.city,
                    County:"India",
                    Country: "IN",
                    State:getData.fk_state.code,
                    AddressType:"bo_BillTo"
                },
                {
                    AddressName:name,
                    Block:getData.address,
                    ZipCode:getData.zip_code,
                    City:getData.fk_city.city,
                    County:"India",
                    Country: "IN",
                    State:getData.fk_state.code,
                    AddressType:"bo_ShipTo"
                }
            ],
            ContactEmployees:[
                {
                    Name:name,
                    MobilePhone:getData.mobile,
                    E_Mail:getData.email
                }
            ]
        }

        // sap login
        const config  =await getSapLoginToken();
        const createDataonSap =  await axios.post(process.env.sap_URL + "/BusinessPartners",creatData,config)
                    .then((response)=>{
                        if(response){
                            console.log(response.data)
                           return response.data
                        }
                        return "something went wrong while create customer"
                    })
                    .catch((e)=>{
                        return e.response.data.error.message.value
                    })
        return ({status:"success",message:createDataonSap.CardCode});
    }catch(e){
        return ({status:'error',message: e.message});
    }
}