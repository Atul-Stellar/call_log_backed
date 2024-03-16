const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  });

  const s3 = new AWS.S3();
var dirname = process.env.AWS_S3_BUCKET_NAME;
if(process.env.env == 'dev'){
  dirname = process.env.AWS_S3_BUCKET_NAME+'/demo';
}
exports.UploadInvoicePDF = async (fileContent,fileName)=>{
    const params = {
        Bucket: dirname+'/docprint/invoice',
        Key: fileName+'.pdf',
        Body: fileContent,
      };
     let dt = await s3.upload(params).promise();
      console.log(dt.Location);
     return dt.Location 

}
exports.UploadCreditPDF = async (fileContent,fileName)=>{
  const params = {
      Bucket: dirname+'/docprint/credit',
      Key: fileName+'.pdf',
      Body: fileContent,
    };
   let dt = await s3.upload(params).promise();
    console.log(dt.Location);
   return dt.Location

}
exports.uploadInoiceZip = async (fileContent,fileName)=>{
  const params = {
    Bucket: dirname+'/docprint/invoice/zip',
    Key: fileName,
    Body: fileContent,
  };
 let dt = await s3.upload(params).promise();
 return dt.Location
}

exports.uploadGatePass = async (fileContent,fileName)=>{
  const params = {
    Bucket: dirname+'/gatepass',
    Key: fileName+'.pdf',
    Body: fileContent,
  };
 let dt = await s3.upload(params).promise();
  
 return dt.Location
}

exports.updateStatement = async (fileContent,fileName)=>{
  const params = {
    Bucket: dirname+'/statement',
    Key: fileName+'.pdf',
    Body: fileContent,
  };
 let dt = await s3.upload(params).promise();
  
 return dt.Location
}

