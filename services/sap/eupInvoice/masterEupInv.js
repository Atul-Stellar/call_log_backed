const InitEUPInv = require("./initEupInv");

const syncEUPInv = async (link) => {
  let links = link ? link : "NA";
  InitEUPInv(links);
  // console.log("runnning")
};

module.exports = syncEUPInv;


