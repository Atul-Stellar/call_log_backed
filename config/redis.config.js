 require('dotenv').config();
const Redis = require("ioredis");
console.log(process.env.env);
if(process.env.env == 'dev'){
 var redisClient = new Redis();
 console.log(redisClient.status)
}
else{
console.log("test1")
console.log(process.env.REDIS_HOST)
var redisClient = new Redis(process.env.REDIS_HOST);
console.log(redisClient.status)
console.log("test over")
}
module.exports =  redisClient;

