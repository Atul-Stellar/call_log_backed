const redisClient = require("../config/redis.config");


exports.RedisSchoolDeleteUser = async (userid) => {
    
    const get = await redisClient.get("AllSchoolUsers"+userid);
    if (get) {
      const del = await redisClient.del("AllSchoolUsers"+userid);
      if(del){
        console.log("school delete from redis");
      }else{
        console.log("school not delete from redis");
      }
    }
   
  };