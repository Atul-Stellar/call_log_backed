const sales_data = require("../../../models/sales_data");
const { Op } = require("sequelize");
exports.AutoDeleteEUPInv = async () => {
  try {
    let allInv = await sales_data.eup_invoice.findAll({
      where: { inv_no: {
       [Op.or]:[null,""]
      } },
    });
    console.log(allInv.length);
    if (allInv.length != 0) {
      await Promise.all(
        allInv.map(async (item) => {
          let checkTag = await sales_data.eup_invoice_schools.count({
            where: { fk_eup_invoice_id: item.id },
          });
          if (checkTag == 0) {
            await sales_data.eup_invoice_items.destroy({
              where: {
                fk_eup_invoice_id: item.id,
              },
            });
            await sales_data.eup_invoice_address.destroy({
              where: {
                fk_eup_invoice_id: item.id,
              },
            });
            await sales_data.eup_invoice.destroy({
              where: {
                id: item.id,
              },
            });
          }
        })
      );
    }
  } catch (e) {
    return e.message;
  }
};

exports.AutoDeleteEupInvWitoutItem = async ()=>{
  const get  = await sales_data.eup_invoice.findAll({
    attributes:['id'],
    include:{
      attributes:['id'],
      model:sales_data.eup_invoice_items,
      as:"eup_invoice_items"
    },
    where:{
      has_item:{
        [Op.or]:[null,false]
      }
    },
    limit:1000
  })
  console.log(get.length)
    if(get.length != 0){
      get.map(async(e)=>{
        console.log(e.id)
          if(e.eup_invoice_items.length == 0){
            await sales_data.eup_invoice_address.destroy({
              where:{fk_eup_invoice_id:e.id}
            })
           await sales_data.eup_invoice.destroy({
              where:{id:e.id}
            })
            
          }else{
            console.log("updating has item")
             await sales_data.eup_invoice.update({
              has_item:true
            },{
              where:{id:e.id}
            })
            
          }
      })
    }
}

exports.AutoDeleteEupInvBYIDWitoutItem = async (id)=>{
    await sales_data.eup_invoice_address.destroy({where:{fk_eup_invoice_id:id}})
    await sales_data.eup_invoice_items.destroy({where:{fk_eup_invoice_id:id}})
    await sales_data.eup_invoice.destroy({where:{id:id}})
}