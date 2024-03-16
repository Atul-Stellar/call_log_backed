const axios = require("axios").default;
const https = require("https");
var moment = require("moment"); 
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

const config = {
  headers: {
    accesskey: process.env.AZURE_SYNC_KEY,
  },
};


exports.IncommingPaymentwithSeries = async (user,todate,fromdate) => {
    // console.log(todate, fromdate)
    return await axios
       .post(
         process.env.AZURE_SYNC_URL + "/api/crm/incommingpayment/get/invoicesales/series",
         {
            todate:moment(todate,'YYYY-MM-DD').format('YYYY-MM-DD'),
            fromdate:moment(fromdate,'YYYY-MM-DD').format('YYYY-MM-DD'),
            user:user
         },
         config

         
       )
       .then((res) => {
         return res.data;
       })
       .catch((e) => {
    
         return e.message;
       });
   };

   exports.getCollections = async (user,todate,fromdate) => {
    // console.log(todate, fromdate)
    return await axios
       .post(
         process.env.AZURE_SYNC_URL + "/api/crm/incommingpayment/get/collections",
         {
            todate:moment(todate,'YYYY-MM-DD').format('YYYY-MM-DD'),
            fromdate:moment(fromdate,'YYYY-MM-DD').format('YYYY-MM-DD'),
            user:user
         },
         config

         
       )
       .then((res) => {
         return res.data;
       })
       .catch((e) => {
    
         return e.message;
       });
   };
   exports.CollectionSReport = async (user,todate,fromdate) => {
    // console.log(todate, fromdate)
    return await axios
       .post(
         process.env.AZURE_SYNC_URL + "/api/crm/incommingpayment/get/collections/report",
         {
            todate:moment(todate,'YYYY-MM-DD').format('YYYY-MM-DD'),
            fromdate:moment(fromdate,'YYYY-MM-DD').format('YYYY-MM-DD'),
            user:user
         },
         config

         
       )
       .then((res) => {
         return res.data;
       })
       .catch((e) => {
    
         return e.message;
       });
   };

