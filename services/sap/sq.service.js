const axios = require("axios").default;
const https = require("https");
const URL = process.env.sap_URL;
var cron = require("node-cron");
var fs = require("fs");

var public = require("../../models/public");
var school = require("../../models/school");
var sales_data = require("../../models/sales_data");
const users = require("../../models/users");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
