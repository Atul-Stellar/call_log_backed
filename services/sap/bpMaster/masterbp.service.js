const InitBpMaster = require("./initBp.service");
var cron = require("node-cron");
const syncQueues = require("../../../config/sync_jobs.config");
const syncBps = async () => {
  let link = "NA";
  InitBpMaster(link);
};

module.exports = syncBps;
