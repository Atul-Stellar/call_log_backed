const puppeteer = require('puppeteer');
const { uploadGatePass } = require('../../config/S3.config');
require("dotenv").config();
 
exports.GenerateGatePass = async (id,name)=>{
    try{
        let filname = 'gatepass_'+name+"_"+Date.now().toString()
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const website_url = process.env.UI_CRM_URL+"gate_pass_pdf/"+id;
        console.log(website_url);
        await page.goto(website_url, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');
        const pdf = await page.pdf({
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
            printBackground: false,
          });
          await browser.close();

    let url =  await uploadGatePass(pdf,filname);
          return url;
    }catch(e){
        return e.message;
    }
}