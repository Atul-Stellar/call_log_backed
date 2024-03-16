const puppeteer = require('puppeteer');
const { updateStatement } = require('../../config/S3.config');
require("dotenv").config();


exports.GenerateLedgerPDF =  async (bpcode,fromdate,todate)=>{
    try{
        let filname = 'statement_'+bpcode+"_"+fromdate+"_"+todate+"_"+Date.now().toString()
        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        const website_url = process.env.UI_CRM_URL+"cust_ledger/"+bpcode+'/'+fromdate+'/'+todate;
       
        await page.goto(website_url, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');
        const pdf = await page.pdf({
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
            printBackground: false,
          });
          await browser.close();
                    
    let url =  await updateStatement(pdf,filname);
          return url;
    }catch(e){
        return e.message;
    }
}