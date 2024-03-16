const InitCkOrder = require("./intickOrder.service");


const syncCkOrder = async () => {
  let link = "NA";
  InitCkOrder(link);
};

module.exports = syncCkOrder;
