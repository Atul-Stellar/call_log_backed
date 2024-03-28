const moment = require('moment-timezone');

exports.DateIST = ()=>{
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD')
}