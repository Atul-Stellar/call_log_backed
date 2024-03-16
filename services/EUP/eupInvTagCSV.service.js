const { eup_inv_csv } = require("../../models/public")
const { Op } = require("sequelize");
const sales_data = require("../../models/sales_data");
const school = require("../../models/school");
const { AutoDeleteEupInvBYIDWitoutItem } = require("../sap/eupInvoice/autoDeleteInv.service");
const { ReSyncEupInvSingle } = require("../sap/eupInvoice/autoSyncEupInvNo.service");
var moment = require('moment');
exports.EUPINVTAGCSV = async()=>{
    let getInv = await eup_inv_csv.findAll({
       limit:200,
        where:
            {
                status:{
                    [Op.ne]:true
                },
                error:{
                    [Op.or]:[null,'N/A','']
                }
            }
        
    })
    if(getInv){
        console.log(getInv.length)
        if(getInv.length != 0){

            tagInv(getInv)
        }
    }
}

function  tagInv(data) {
    if(data.length != 0){
        data.map(async(e)=>{
            let findInv = await sales_data.eup_invoice.findOne({
                attributes:['id','inv_no'],
                where:{'inv_no':e.inv}
            });
            if(findInv){
              
                let findSchool = await school.school_master.findOne({
                    attributes:['id'],
                    where:{"temp_id":e.scode}
                });
                if(findSchool){
        
                    let findInvItem = await sales_data.eup_invoice_items.findAll({
                        attributes:['id','itemcode','itemdescription','quantity'],
                        where:{fk_eup_invoice_id:findInv.id}
                    })
                    if(findInvItem && findInvItem.length != 0){
                        let inv = await sales_data.eup_invoice_schools.count({
                            where:{
                                fk_eup_invoice_id:findInv.id,
                                fk_school_id:findSchool.id
                            }
                        });
                        if(inv == 0){
                         
                            let tagDet = [];
                            findInvItem.map((i)=>{
                                tagDet.push({
                                    fk_eup_invoice_id:findInv.id,
                                    fk_school_id:findSchool.id,
                                    item_code:i.itemcode,
                                    quantity:i.quantity,
                                    itemdescription:i.itemdescription
                                })
                            })
                            let Createinv = await sales_data.eup_invoice_schools.bulkCreate(tagDet)
                            if(Createinv){
                              
                                await eup_inv_csv.update({
                                    status:true,
                                    error:"done"
                                },
                                {
                                    where:{
                                       id:e.id
                                    }
                                });
                                 await sales_data.eup_invoice.update({
                                    status:true
                                },
                                {
                                    where:{
                                        id:findInv.id
                                    }
                                });

                                console.log("tagged")
                            }
                        }
                    }else{
                        await AutoDeleteEupInvBYIDWitoutItem(findInv.id)

                    }
                }else{
                    await eup_inv_csv.update({
                        status:false,
                        error:"school not found"
                    },
                    {
                        where:{
                           id:e.id
                        }
                    });
                }
            }else{
                let inv = e.inv;
                let docNum = inv.split('/');
                console.log(e.date)
                let docdate = moment(e.date,'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(docdate)

              
               const createInv= await ReSyncEupInvSingle(docNum[1],docdate)
               console.log("sts")
               console.log(createInv)
               if(createInv == 'done'){
                let findInv = await sales_data.eup_invoice.findOne({
                    attributes:['id','inv_no'],
                    where:{'inv_no':e.inv}
                });
                if(findInv){
                  
                    let findSchool = await school.school_master.findOne({
                        attributes:['id'],
                        where:{"temp_id":e.scode}
                    });
                    if(findSchool){
            
                        let findInvItem = await sales_data.eup_invoice_items.findAll({
                            attributes:['id','itemcode','itemdescription','quantity'],
                            where:{fk_eup_invoice_id:findInv.id}
                        })
                        if(findInvItem && findInvItem.length != 0){
                            let inv = await sales_data.eup_invoice_schools.count({
                                where:{
                                    fk_eup_invoice_id:findInv.id,
                                    fk_school_id:findSchool.id
                                }
                            });
                            if(inv == 0){
                             
                                let tagDet = [];
                                findInvItem.map((i)=>{
                                    tagDet.push({
                                        fk_eup_invoice_id:findInv.id,
                                        fk_school_id:findSchool.id,
                                        item_code:i.itemcode,
                                        quantity:i.quantity,
                                        itemdescription:i.itemdescription
                                    })
                                })
                                let Createinv = await sales_data.eup_invoice_schools.bulkCreate(tagDet)
                                if(Createinv){
                                    
                                    await eup_inv_csv.update({
                                        status:true,
                                        error:"done"
                                    },
                                    {
                                        where:{
                                           id:e.id
                                        }
                                    });
                                   
                                     await sales_data.eup_invoice.update({
                                        status:true
                                    },
                                    {
                                        where:{
                                            id:findInv.id
                                        }
                                    });
                                    console.log("tagged")
                                }
                            }
                        }else{
                            await AutoDeleteEupInvBYIDWitoutItem(findInv.id)
    
                        }
                    }else{
                        console.log("school not found")
                        await eup_inv_csv.update({
                            status:false,
                            error:"school not found"
                        },
                        {
                            where:{
                               id:e.id
                            }
                        });
                    }
                }
               }else if(createInv == 'usernotfound'){
                console.log("usernotfound")
                await eup_inv_csv.update({
                    status:false,
                    error:"user not found this inv"
                },
                {
                    where:{
                       id:e.id
                    }
                });
               }else if(createInv == 'false'){
                console.log("false")
                await eup_inv_csv.update({
                    status:false,
                    error:"already tagged"
                },
                {
                    where:{
                       id:e.id
                    }
                });
               }
            //    if()
            }
        })
    }
}