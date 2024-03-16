const sales_data = require("../../../models/sales_data");
const { Op } = require("sequelize");
const { getInvoiceNumber } = require("../../azure_sync/invoice.service");
exports.autoSyncCkInvNumber = async ()=>{
    try{
        const get = await sales_data.ck_invoice.findAll({
            attributes:['id','docnum','docdate','inv_no'],
            where:{
                inv_no:{
                    [Op.or]:[null,'']
                }
                
            },
            limit:50
        });
        console.log(get.length);
        if(get){
          
            if(get.length != 0){
                await Promise.all(
                    get.map(async (e) => {
                        let getInv = await getInvoiceNumber(e.docnum,e.docdate);
                        let invn = "N/A";
                            if(getInv.message.inv_no != null){
                                invn = getInv.message.inv_no;
                            }
                        if(getInv){
                            if(getInv.inv != ''){
                                await sales_data.ck_invoice.update({
                                    inv_no:invn
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

exports.UpdateCKNAInvNo = async()=>{
    try{
         await sales_data.ck_invoice.update({
            inv_no:""
        },
        {
            where:{inv_no:"N/A"}
        })
    }catch(e){
        console.log(e.message);
    }
}