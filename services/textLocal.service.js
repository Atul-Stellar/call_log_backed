const axios = require("axios");
require('dotenv').config();

exports.sendSmsTextLocal = async(phone,sms)=>{
    
    let key = process.env.TEXTLOCAL_KEY
    
    var url = 'https://api.textlocal.in/send/?apikey='+key+'&numbers='+phone+'&sender=PROFLS&message=' + encodeURIComponent(sms);
    let send = await axios.get(url);
    console.log(send.data)
        return {status:send.data.status}
     
}