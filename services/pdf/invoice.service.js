const puppeteer = require("puppeteer");
const { UploadInvoicePDF } = require("../../config/S3.config");
require("dotenv").config();

exports.GeneratePdf = async (docNum, docdate) => {
  try {
    let filname = "inv_" + docNum + "_" + docdate + "_" + Date.now().toString();
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    const website_url =
      process.env.UI_CRM_URL + "view_pdf/" + docNum + "/" + docdate;
    console.log(website_url);
    await page.goto(website_url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    const pdf = await page.pdf({
      margin: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
      printBackground: false,
    });
    await browser.close();

    let url = await UploadInvoicePDF(pdf, filname);
    return url;
  } catch (e) {
    return e.message;
  }
};
exports.GenerateBulkPdf = async (bp, todate, fromdate) => {
  try {
    let filname =
      "inv_bulk_" +
      bp +
      "_" +
      todate +
      "_" +
      fromdate +
      "_" +
      Date.now().toString();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const website_url =
      process.env.UI_CRM_URL +
      "bulkinv_pdf/" +
      bp +
      "/" +
      todate +
      "/" +
      fromdate;
    console.log(website_url);
    await page.goto(website_url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    const pdf = await page.pdf({
      margin: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
      printBackground: false,
    });
    await browser.close();

    let url = await UploadInvoicePDF(pdf, filname);
    return url;
  } catch (e) {
    return e.message;
  }
};
