const stat = require("fs").statSync;
const fs = require("fs");
const AdmZip = require("adm-zip");
const { uploadInoiceZip } = require("../../config/S3.config");
var request = require("request-promise").defaults({ encoding: null });
const zip = new AdmZip();

exports.InvoiceZip = async (url, filename) => {
  try {
    let PromiseArray = url.map((dataItem) => {
      return request.get(dataItem);
    });
    let data = await Promise.all(PromiseArray);
    data.map((bufferData, index) => {
      console.log(bufferData);
      const pdfUrlName = url[index].url;
      console.log(pdfUrlName);
      const pdfName =
        "invoice " +
        pdfUrlName.split("/")[5].split(".")[0].split("_")[1] +
        " " +
        pdfUrlName.split("/")[5].split(".")[0].split("_")[2];
      zip.addFile(pdfName + ".pdf", bufferData);
    });
    return await uploadInoiceZip(zip.toBuffer(), filename + ".zip");
  } catch (e) {
    return e.message;
  }
};
