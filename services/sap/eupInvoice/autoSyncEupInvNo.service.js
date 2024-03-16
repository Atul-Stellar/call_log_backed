const sales_data = require("../../../models/sales_data");
const { Op } = require("sequelize");
const { getInvoiceNumber, getInvoiceSo_No } = require("../../azure_sync/invoice.service");
const { getItemInfoSap } = require("../ItemMaster/getItemInfo.service");
const { eup_inv_csv } = require("../../../models/public");
const { getSapLoginToken } = require("../login.service");
const { default: axios } = require("axios");
var moment = require('moment');
const {
    getInvNumber,
  } = require("../../../controllers/api/doc_print/invoice.controller");
const users = require("../../../models/users");
const { getItemDetailFromAzure } = require("../../azure_sync/item.service");

exports.autoSyncEupInvNumber = async ()=>{
    try{
        const get = await sales_data.eup_invoice.findAll({
            attributes:['id','docnum','docdate','inv_no'],
            where:{
                inv_no:{
                    [Op.or]:[null,'']
                }
                
            },
            order:[['createdAt','ASC']],
            limit:250
        });
        if(get){
            if(get.length != 0){
                await Promise.all(
                    get.map(async (e) => {
                        let getInv = await getInvoiceNumber(e.docnum,e.docdate);

                        if(getInv){
                            let invn = "N/A";
                            if(getInv.message.inv_no != null){
                                invn = getInv.message.inv_no;
                            }
                            if(getInv.inv != ''){
                                await sales_data.eup_invoice.update({
                                    inv_no:invn,
                                    inv_type:getInv.message.invType
                                },
                                {
                                    where:{id:e.id}
                                })
                            }
                        } 
                    }))
            }
        }
    }catch(e){
        console.log(e.message);
    }
}

exports.UpdateEUPNAInvNo = async()=>{
    try{
         await sales_data.eup_invoice.update({
            inv_no:""
        },  
        {
            where:{inv_no:"N/A"}
        })
    }catch(e){
        console.log(e.message);
    }
}

exports.findNullItemDetailEupInvSap = async()=>{
    const getItemcode = await sales_data.eup_invoice_items.findAll({
        attributes:['itemcode'],
        limit:300,
        group: ["itemcode"],

        where:{
            [Op.or]:{
               
              series:{
                    [Op.or]:["",null]
                }
            },
        }
    }) 
    if(getItemcode){
      await  updateItemDetailEupInvSap(getItemcode)
    }
}

const updateItemDetailEupInvSap = async(data)=>{
    // 
   if(data.length !=0){
    await Promise.all(
        data.map(async (e) => {
            console.log(e.itemcode)
            let data = await getItemDetailFromAzure(e.itemcode)
           
            if(data.status == 'success'){

                    if(data.message.length !=0 ){
                      var gr = '';
                      var sr = '';
                      if(data.message[0].U_Grade == null){
                        gr = "N/A"
                      }
                      else if(data.message[0].U_Grade == undefined){
                        gr = "N/A"
                      }else{
                        gr = data.message[0].U_Grade 
                      }
                      if(data.message[0].U_Series == null){
                        sr = "N/A"
                      }
                      else if(data.message[0].U_Series == undefined){
                        sr = "N/A"
                      }else{
                        sr = data.message[0].U_Series 
                      }


                        let updates = await sales_data.eup_invoice_items.update({
                            subject:data.message[0].U_Subject,
                            series:sr,
                            grade:gr
                        },
                        {
                            where:{
                                itemcode:e.itemcode
                            }
                        }
                        )
        
                        console.log(updates)
                    }
                
                
             
            }
           
        }))
   }
console.log("deon!")
}

exports.ResyncEupInvData = async ()=>{
    const get = await eup_inv_csv.findAll({
        attributes:['inv','date'],
        where:[
            {status:{
                [Op.or]:[false,null]
            }},
            {error:"inv not found"}
        ],
        limit:500,
        
    });
    if(get.length != 0){
        const config = await getSapLoginToken();
        get.map(async(resp)=>{
            let inv = resp.inv;
            let docNum = inv.split('/');
            let docdate = moment(resp.date,'DD-MM-YYYY').format('YYYY-MM-DD')
            console.log(docNum[1])
            const checkInv = await sales_data.eup_invoice.count({
                where:{
                    docnum:docNum[1],
                    docdate:docdate
                }
            })
            if(checkInv == 0){
                await axios.get(process.env.sap_URL + "/Invoices?$filter=DocNum eq "+docNum[1] +" and DocDate eq '"+docdate+"'",config)
                .then(async(response)=>{
                    console.log(response)
                    if(response){
                        if(response.data.value.length != 0){
                            let datas = response.data.value;
                            await Promise.all(
                                datas.map(async (e) => {
                                    let sts = false;
                                    if (e.hasOwnProperty("DocumentLines")) {
                                      let md = e.DocumentLines;
                                      if (md.length != 0) {
                                        // console.log("up");
                                        sts = await Promise.all(
                                          md.map(async (m) => {
                                            let itmCode = m.ItemCode;
                                            if (itmCode.substring(0, 3) == "CLK") {
                                              return true;
                                            }
                                            return false;
                                          })
                                        );
                                      }
                                    }
                            
                                    let sts1 = sts.toString();
                                    let ckItemSts = sts1.includes("true");
                                      var invType = "ck";
                                      if(ckItemSts == false){
                                        invType = "eupheus"
                                      }
                                      const ckInv = await sales_data.eup_invoice.count({
                                        where: { docentery: e.DocEntry },
                                      });
                                      let getInvNo = await getInvNumber(e.DocNum, e.DocDate);
                                     
                                      if (
                                        ckInv == 0 
                                       
                                      ) {
                                        let user_id = await users.user_master.findOne({
                                          attributes: ["id"],
                                          where: { SalesPersonCode: e.SalesPersonCode },
                                        });
                                        if (user_id) {
                                          const createInv = await sales_data.eup_invoice.create({
                                            docnum: e.DocNum,
                                            docdate: e.DocDate,
                                            cardcode: e.CardCode,
                                            cardname: e.CardName,
                                            doctotal: e.DocTotal,
                                            u_sname: e.U_SName,
                                            u_scode: e.U_SCode,
                                            docentery: e.DocEntry,
                                            fk_user_id: user_id.id,
                                            gsttransactiontype: e.GSTTransactionType,
                                            inv_no: getInvNo.message.message.inv_no,
                                            inv_type:getInvNo.message.message.invType,
                                            boxes: e.U_Boxes,
                                            invtype:invType
                                          });
                                          if (createInv) {
                                            if (e.hasOwnProperty("EWayBillDetails")) {
                                              let eb = e.EWayBillDetails;
                            
                                              await sales_data.eup_invoice_address.create({
                                                fk_eup_invoice_id: createInv.id,
                                                BillFromName: eb.BillFromName,
                                                DispatchFromAddress1: eb.DispatchFromAddress1,
                                                BillToName: eb.BillToName,
                                                ShipToAddress1: eb.ShipToAddress1,
                                              });
                                            }
                                            if (e.hasOwnProperty("DocumentLines")) {
                                              let data = [];
                                              let md = e.DocumentLines;
                                              if (md.length != 0) {
                                                await Promise.all(
                                                  md.map(async (m) => {
                                                    const getItem = await getItemInfoSap(m.ItemCode)
                                                    let datas = getItem.message.value
                                                    if(datas && datas.length !=0){
                                                      console.log("item creatd!")
                                                      if(getItem){
                                                        await sales_data.eup_invoice_items.create(
                                                          {
                                                              fk_eup_invoice_id: createInv.id,
                                                              itemcode: m.ItemCode,
                                                              itemdescription: m.ItemDescription,
                                                              quantity: m.Quantity,
                                                              price: m.Price,
                                                              discountpercent: m.DiscountPercent,
                                                              subject:datas[0].U_Subject,
                                                              series:datas[0].U_Series,
                                                              grade:datas[0].U_Grade
                                                            }
                                                        );
                                                      }
                                                    }else{
                                                      if(getItem){
                                                        console.log("item creatd!")
                                                        await sales_data.eup_invoice_items.create(
                                                          {
                                                              fk_eup_invoice_id: createInv.id,
                                                              itemcode: m.ItemCode,
                                                              itemdescription: m.ItemDescription,
                                                              quantity: m.Quantity,
                                                              price: m.Price,
                                                              discountpercent: m.DiscountPercent,
                                                              subject:null,
                                                              series:null,
                                                              grade:null
                                                            }
                                                        );
                                                      }
                                                    }
                                                     
                                                  })
                                                  
                                                );
                                                
                                              }
                                             
                                              
                                               
                                            
                                            //     await eup_inv_csv.update({
                                            //         error:null
                                            //     },
                                            //    {
                                            //     where:{
                                            //         inv:resp.inv
                                            //     }
                                            //    }
                                            //     )
                                              
                                            }
                                          }
                                        }
                                      }
                                    
                                  
                                })
                              );
                        }
                    }
                })
                .catch((e)=>{
                    console.log(e)
                })
            }

        await eup_inv_csv.update({
            error:"N/A",

        },
        {
            where:{inv:resp.inv}
        }
        ) 
        console.log(resp.inv)  
        })
    }

    return {status:"suucess",message:"done!"}
}

exports.ReSyncEupInvSingle = async(docnum,date)=>{
  const config = await getSapLoginToken();
  var error = [];
   return await axios.get(process.env.sap_URL + "/Invoices?$filter=DocNum eq "+docnum +" and DocDate eq '"+date+"'",config)
  .then(async(response)=>{
      if(response){
          if(response.data.value.length != 0){
            console.log("inside")
              let datas = response.data.value;
              await Promise.all(
                  datas.map(async (e) => {
                      let sts = false;
                      if (e.hasOwnProperty("DocumentLines")) {
                        let md = e.DocumentLines;
                        if (md.length != 0) {
                          // console.log("up");
                          sts = await Promise.all(
                            md.map(async (m) => {
                              let itmCode = m.ItemCode;
                              if (itmCode.substring(0, 3) == "CLK") {
                                return true;
                              }
                              return false;
                            })
                          );
                        }
                      }
              
                      let sts1 = sts.toString();
                      let ckItemSts = sts1.includes("true");
                        var invType = "ck";
                        if(ckItemSts == false){
                          invType = "eupheus"
                        }
                        const ckInv = await sales_data.eup_invoice.count({
                          where: { docentery: e.DocEntry },
                        });
                        console.log(ckInv)
                        console.log("found inv")
                        let getInvNo = await getInvNumber(e.DocNum, e.DocDate);
                        if (
                          ckInv == 0 
                         
                        ) {
                          let user_id = await users.user_master.findOne({
                            attributes: ["id"],
                            where: { SalesPersonCode: e.SalesPersonCode },
                          });
                          if (user_id) {
                            const createInv = await sales_data.eup_invoice.create({
                              docnum: e.DocNum,
                              docdate: e.DocDate,
                              cardcode: e.CardCode,
                              cardname: e.CardName,
                              doctotal: e.DocTotal,
                              u_sname: e.U_SName,
                              u_scode: e.U_SCode,
                              docentery: e.DocEntry,
                              fk_user_id: user_id.id,
                              gsttransactiontype: e.GSTTransactionType,
                              inv_no: getInvNo.message.message.inv_no,
                              inv_type:getInvNo.message.message.invType,
                              boxes: e.U_Boxes,
                              invtype:invType
                            });
                            if (createInv) {
                              if (e.hasOwnProperty("EWayBillDetails")) {
                                let eb = e.EWayBillDetails;
              
                                await sales_data.eup_invoice_address.create({
                                  fk_eup_invoice_id: createInv.id,
                                  BillFromName: eb.BillFromName,
                                  DispatchFromAddress1: eb.DispatchFromAddress1,
                                  BillToName: eb.BillToName,
                                  ShipToAddress1: eb.ShipToAddress1,
                                });
                              }
                              if (e.hasOwnProperty("DocumentLines")) {
                                let data = [];
                                let md = e.DocumentLines;
                                if (md.length != 0) {
                                  await Promise.all(
                                    md.map(async (m) => {
                                      const getItem = await getItemInfoSap(m.ItemCode)
                                      let datas = getItem.message.value
                                      if(datas && datas.length !=0){
                                        console.log("item creatd!")
                                        let disco = 0;
                                        if(m.DiscountPercent){
                                          disco = m.DiscountPercent;
                                        }
                                        if(getItem){
                                          await sales_data.eup_invoice_items.create(
                                            {
                                                fk_eup_invoice_id: createInv.id,
                                                itemcode: m.ItemCode,
                                                itemdescription: m.ItemDescription,
                                                quantity: m.Quantity,
                                                price: m.Price,
                                                discountpercent: disco,
                                                subject:datas[0].U_Subject,
                                                series:datas[0].U_Series,
                                                grade:datas[0].U_Grade
                                              }
                                          );
                                        }
                                      }else{
                                        if(getItem){
                                          console.log("item creatd!")
                                          let disco = 0;
                                        if(m.DiscountPercent){
                                          disco = m.DiscountPercent;
                                        }
                                          await sales_data.eup_invoice_items.create(
                                            {
                                                fk_eup_invoice_id: createInv.id,
                                                itemcode: m.ItemCode,
                                                itemdescription: m.ItemDescription,
                                                quantity: m.Quantity,
                                                price: m.Price,
                                                discountpercent:disco,
                                                subject:null,
                                                series:null,
                                                grade:null
                                              }
                                          );
                                        }
                                      }
                                       
                                    })
                                    
                                  );
                                  
                                }
                               
                                
                                 
                              
                              //     await eup_inv_csv.update({
                              //         error:null
                              //     },
                              //    {
                              //     where:{
                              //         inv:resp.inv
                              //     }
                              //    }
                              //     )
                                
                              }
                            }else{
                             
                            error.push('createerror')
                            }
                          }else{
                            error.push('usernotfound')
                          }
                        
                          error.push('done')

                        }else{
                        error.push('false')

                        }
                      
                    
                  })

                );
                return error[0]

          }
          return "NO data found"
      }
  })
  .catch((e)=>{

      console.log(e)
  })
}

exports.SyncEupInvCsv = async ()=>{
  const get = await eup_inv_csv.findAll({
    attributes:['inv','id','date','scode'],
    where:
      {status:{
        [Op.or]:[false,null]
    }},
    limit:300
  })
  if(get.length != 0){
    get.map(async(inv)=>{
      const checkInv = await sales_data.eup_invoice.findOne({
        attributes:['id'],
        where:{
          inv_no:inv.inv
        }
      })
      if(checkInv){

      }
    })
  }
}

exports.EupInvSoNo = async ()=>{
  try{
    let get = await sales_data.eup_invoice.findAll({
      attributes:['id','docnum','docdate'],
      where:{
        so_no:null
      },
      limit:250
    })
    if(get.length != 0){
      get.map(async(e)=>{
        let sono = await getInvoiceSo_No(e.docnum,e.docdate);
        let so_no = 0;
        if(sono.message != null || sono.message != undefined){
          if(sono.message.length != 0){
            so_no = sono?.message[0]?.SO_No;
            if(so_no == undefined || so_no == null){
              so_no=0;
            }
    
            await sales_data.eup_invoice.update(
              {
                so_no:so_no
              },
              {
                where:{
                  id:e.id
                }
              }
            )
            console.log("so update")
          }
        }
       
      })
    }
  }catch(e){
    console.log(e)
  }
}