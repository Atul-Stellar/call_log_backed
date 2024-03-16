const axios = require("axios");
require("dotenv").config();

exports.PDFMicroInvoice = async (docNum, docDate) => {
  console.log(docNum, docDate);
  return axios
    .get(process.env.MICRO_PDF_URL + "/inv/single_pdf", {
      data: {
        docNum,
        docDate,
      },
    })
    .then((res) => {
      return res.data.message;
    })
    .catch((e) => {
      // console.log(e);
      return e.message;
    });
};
