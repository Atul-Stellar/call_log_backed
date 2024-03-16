const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../config/redis.config");
const URL = process.env.sap_URL;
const { getLogin } = require("./login.service");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

exports.getItemMasters = async (req, res) => {
  try {
    var spToken = saplogin;
    let config = {
      headers: {
        Cookie:
          "B1SESSION=" +
          JSON.stringify(spToken.data)
            .split(",")[0]
            .split(":")[1]
            .replace('"', "")
            .replace('"', "") +
          ";" +
          JSON.stringify(spToken.data)
            .split(",")[1]
            .split(":")[1]
            .replace("]", "")
            .replace("}", "")
            .replace('"', "")
            .replace('"', ""),
      },
    };

    const ress = await axios.get(URL + "/Items", config);
    return res
      .status(200)
      .json({
        status: "error",
        message: ress.data,
        link: Object.values(ress.data)[2],
      });
    // return res.status(200).json({status:'error',message: req.body});
  } catch (e) {
    console.log(e);
  }
};
