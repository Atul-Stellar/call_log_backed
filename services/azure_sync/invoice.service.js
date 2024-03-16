const axios = require("axios").default;
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

const config = {
  headers: {
    accesskey: process.env.AZURE_SYNC_KEY,
  },
};

exports.getInvoiceDetail = async (docNum, date) => {
  let data = {
    doc_num: docNum,
    doc_date: date,
  };
  return await axios
    .post(
      process.env.AZURE_SYNC_URL + "/api/doc_print/invoice/detail",
      data,
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};
exports.getInvoiceNumber = async (docNum, date) => {
  let data = {
    docnum: docNum,
    date: date,
  };
  return await axios
    .post(
      process.env.AZURE_SYNC_URL + "/api/doc_print/invoice/number",
      data,
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};

exports.getBulkInvDetail = async (bp, todate, fromdate) => {
  let data = {
    todate: todate,
    fromdate: fromdate,
    bp: bp,
  };
  // sdhffdsfd
  return await axios
    .post(
      process.env.AZURE_SYNC_URL + "/api/doc_print/invoice/bulk",
      data,
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};
exports.getInvoiceSo_No = async (docNum, date) => {
  let data = {
    doc_num: docNum,
    doc_date: date,
  };
  return await axios
    .post(
      process.env.AZURE_SYNC_URL + "/api/doc_print/invoice/get/sono",
      data,
      config
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e.message;
    });
};