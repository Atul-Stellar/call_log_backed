var cron = require("node-cron");
const InitItemMaster = require("./initItem.service");
const syncQueues = require("../../../config/sync_jobs.config");

const syncItems = async () => {
  let link = "NA";
  InitItemMaster(link);
};

module.exports = syncItems;
