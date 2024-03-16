const sales_data = require("../../../models/sales_data")
const { Op } = require("sequelize");
const { getSapLoginToken } = require("../login.service");
const { default: axios } = require("axios");
const { getLogin } = require("../login.service");

exports.getAddressEupInv = async()=>{
    const get = await sales_data.eup_invoice_address.findAll({
        attributes:['id','fk_eup_invoice_id'],
        limit:100,
        include:{
            attributes:['id','docnum','docdate','docentery'],
            model:sales_data.eup_invoice,
            as:"fk_eup_invoice"
        },
        where:{
            billtostate:{
                [Op.or]:['',null]
            },
        }
    })

    if(get.length != 0){
        const config = await getSapLoginToken();
        
        get.map(async(e)=>{
            console.log(e.id)
           if(e.fk_eup_invoice.docentery){
            await axios.get(process.env.sap_URL + "/Invoices?$filter=DocEntry eq "+e.fk_eup_invoice.docentery+"  ",config)
            .then(async(response)=>{
                if(response){
                    console.log(response.data.value[0].DocEntry)
                    console.log(response.data.value[0].AddressExtension.BillToState)
                   const update = await sales_data.eup_invoice_address.update({
                        billtostate:response.data.value[0].AddressExtension.BillToState,
                        billtocity:response.data.value[0].AddressExtension.BillToCity,
                        shiptocity:response.data.value[0].AddressExtension.ShipToCity,
                        shiptostate:response.data.value[0].AddressExtension.ShipToState,
                    },
                    {
                        where:{fk_eup_invoice_id:e.fk_eup_invoice_id}
                    }) 
                    if(update){
                        console.log("address updated")
                    }
                }
            })
            .catch((e)=>{
                
                console.log(e)
                // return e.response.data.error.message.value
            })
           }
        })
    }
    return {status:"success",message:"done!"}
}