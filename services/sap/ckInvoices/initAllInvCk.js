const { read } = require("pdfkit");
const { InvCk } = require("./all_invoice_ck");

const GetAllInvCk = async (req, res) => {
  let initURL = "NA";
  if (req.body.link) {
    initURL = req.body.link;
  }
  let dt = await InvCk(initURL);
  return res.status(200).json({ message: dt });
};

module.exports = GetAllInvCk;
