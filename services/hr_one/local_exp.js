const axios = require("axios").default;
const sequelize = require("sequelize");
const public = require("../../models/public");
const users = require("../../models/users");
const school = require("../../models/school");
const https = require("https");
const redisClient = require("../../config/redis.config");
const { hrOne_posts, hrOne_errors } = require("../../config/log.config");
let date_ob = new Date();
require("dotenv").config();
var date = ("0" + date_ob.getDate()).slice(-2);
var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
var year = date_ob.getFullYear();
const haversine = require("haversine-distance");
const qs = require("qs");
const { Op } = require("sequelize");
var moment = require("moment");

// moment.tz.link("Asia/Calcutta|Asia/Kolkata");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

let config = {
  headers: {
    apikey: process.env.HR_ONE_apikey,
    domaincode: process.env.HR_ONE_domaincode,
    accesskey: process.env.HR_ONE_accesskey,
    "Content-Type": "application/x-www-form-urlencoded",
  },
};
exports.redisFlush = async (req, res) => {
  try {
    const get = await users.user_master.findAll();
    if (get) {
      let d = get.map(async (i) => {
        let cv = await redisClient.get("AllSchoolUsers" + i.id);
        if (cv) {
          let mi = await redisClient.del("AllSchoolUsers" + i.id);
          console.log(mi);
        }
        let bp = await redisClient.get(i.emp_id + "_all_bp");
        if (bp) {
          await redisClient.del(i.emp_id + "_all_bp");
        }
      });
    }
    return res.send("all done");
  } catch (e) {
    console.log(e);
  }
};

exports.hrOneTest = async (
  distance,
  destination,
  user_vehicle,
  empId,
  convenseDate,
  fromDestination,
  description
) => {
  let amount;
  if (user_vehicle == 1 || user_vehicle == 4) {
    amount = distance * 12;
    user_vehicle = 1;
  } else if (user_vehicle == 2) {
    amount = distance * 6;
  }

  if (distance != 0) {
    const create = await public.hr_one.create({
      emp: empId,
      vehicle_id: user_vehicle,
      convense_date: convenseDate,
      kilometer: distance,
      amount: amount,
      from_destination: destination,
      to_destination: fromDestination,
      description: description,
      expennse_type: "1",
      policy_id: "1",
      projectcode: "null",
      line_itemstatus: "0",
      filename: "0",
      hr_status: false,
      status: true,
    });
    if (!create) {
      hrOne_errors.error({ status: "from db creation failed" });
    }
  }
  // console.log({status:"entry",data:data,url:process.env.HR_ONE_url})
  // hrOne_posts.error({status:"entry",data:data,url:process.env.HR_ONE_url});
  // hrOne_posts.error({destination,fromDestination});
  // if(distance > 0){
  //   axios
  //   .post(
  //     process.env.HR_ONE_url+"/api/externalexpense/PostLocalConvense",
  //     data,
  //     config
  //   )
  //   .then((data) => {
  //     console.log(data)
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //      hrOne_errors.error(error);
  //   });
  // }
  // return res.send("working fine");
};

exports.hroneBill = async (req, res) => {
  try {
    var distance = 0;
    let allCoordinates = "";
    console.log(allCoordinates.length);

    for (let i = 0; i < allCoordinates.length; i++) {
      console.log(allCoordinates[i], allCoordinates[i + 1]);
      if (allCoordinates[i + 1] != undefined) {
        let temp = haversine(allCoordinates[i], allCoordinates[i + 1]);
        console.log(temp);
        distance = distance + temp;
      }
    }
    distance = (distance / 1000).toFixed(2);
    return res.send("distance");
  } catch (e) {
    console.log(e.message);
  }
};

exports.getDistance = async (req, res) => {
  let dm = [];
  let id = "1f23a8d8-aa00-4451-b251-f85a9b75b7b8";
  let get = await public.user_day.findOne({
    where: { id: id },
  });
  console.log(get);
  if (get) {
    distance = 0;
    let allCoordinates = get.coordinates;
    for (let i = 0; i < allCoordinates.length; i++) {
      if (allCoordinates[i + 1] != undefined) {
        let temp = haversine(allCoordinates[i], allCoordinates[i + 1]);
        dm.push((temp / 1000).toFixed(2));
        distance = distance + temp;
      }
    }

    return res
      .status(200)
      .send({ message: distance / 1000, data: allCoordinates });
  }
};
