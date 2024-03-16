const syncQueues = require("../../../config/sync_jobs.config");
const InitUserMaster = require("./initUser.service");

const syncUsers = async () => {
  let link = "NA";
  InitUserMaster(link);
};

module.exports = syncUsers;
