const puppeteer = require("puppeteer");
const { UploadCreditPDF } = require("../../config/S3.config");
require("dotenv").config();

exports.GeneratePdf = async (docNum, docdate) => {
  try {
    let filname = "credit_" + docNum + "_" + docdate + "_" + Date.now().toString();
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    const website_url =
      process.env.UI_CRM_URL + "credit_note_pdf/" + docNum + "/" + docdate;
    console.log(website_url);
    await page.goto(website_url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    const pdf = await page.pdf({
      margin: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
      printBackground: false,
    });
    await browser.close();

    let url = await UploadCreditPDF(pdf, filname);
    return url;
  } catch (e) {
    return e.message;
  }
};