const moment = require('moment-timezone');

exports.DateSTD = ()=>{
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD')
}