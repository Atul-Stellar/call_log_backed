const sales_data = require("../../../models/sales_data");

exports.AutoDeleteCKInv = async () => {
  try {
    let allInv = await sales_data.ck_invoice.findAll({
      where: { inv_no: {
        [Op.or]:[null,""]
       } },
    });
    if (allInv.length != 0) {
      await Promise.all(
        allInv.map(async (item) => {
          let checkTag = await sales_data.ck_invoice_schools.count({
            where: { fk_ck_invoice_id: item.id },
          });
          if (checkTag == 0) {
            await sales_data.ck_invoice_items.destroy({
              where: {
                fk_ck_invoice_id: item.id,
              },
            });
            await sales_data.ck_invoice_address.destroy({
              where: {
                fk_ck_invoice_id: item.id,
              },
            });
            await sales_data.ck_invoice.destroy({
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
