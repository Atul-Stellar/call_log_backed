const InitCreditMaster = require("./initCredit.service");

const syncCreditMaster = async () => {
  let link = "NA";
    InitCreditMaster(link)
};

module.exports = syncCreditMaster;
