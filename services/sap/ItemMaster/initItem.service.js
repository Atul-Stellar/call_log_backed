require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const {
  syncJobssLog,
  sap_bpMaster_all_Syncs,
} = require("../../../config/log.config");
const redisClient = require("../../../config/redis.config");
const public = require("../../../models/public");
const users = require("../../../models/users");
const { getLogin, getSapLoginToken } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const InitItemMaster =async (link) => {

  let config = await getSapLoginToken()

        if (link === "NA") {
          await public.category_master.update(
            {
              last_update: "N",
            },
            {
              where: { status: true },
            }
          );
          await public.subject_master.update(
            {
              last_update: "N",
            },
            {
              where: { status: true },
            }
          );
          
          await public.series_master.update(
            {
              last_update: "N",
            },
            {
              where: { status: true },
            }
          );
          await public.item_master.update(
            {
              last_update: "N",
            },
            {
              where: { status: true },
            }
          );
          const ress = await axios
            .get(
              process.env.sap_URL +
                "/Items?$select=ItemCode,ItemName,UpdateDate,ItemsGroupCode,U_Grade,U_Series,U_Subject,U_Type,U_CRM_Item,UpdateTime,UpdateDate,ItemPrices&$filter=U_CRM_Item eq'Y'",
              config
            )
            .catch((e) => console.log(e));
          if (ress) {
            let newLink = Object.values(ress.data)[2];
            let data = ress.data;
            await allSync(data, newLink);
          }
        } else if (link && link !== "NA") {
          setTimeout(async () => {
            console.log(link);
            const ress = await axios
              .get(process.env.sap_URL + "/"+link, config)
              .catch((e) => console.log(e));
            if (ress) {
              let newLink = Object.values(ress.data)[2];
              let data = ress.data;
              await allSync(data, newLink);
            }
          }, 500);
        }
 
};

const allSync = async (data, link) => {
  try {
    // sap_bpMaster_all_Syncs.error(data).value;
    let datas = data.value;
    await Promise.all(
      datas.map(async (e) => {
        if (
          e.U_CRM_Item == "Y" &&
          e.U_Subject != "" &&
          e.U_Subject != undefined &&
          e.U_Series != "" &&
          e.U_Series != undefined &&
          e.ItemsGroupCode != "" &&
          e.ItemsGroupCode != undefined
        ) {
          try {
            if (e.U_Type != "") {
              const getCategory = await public.category_master.count({
                where: { grp_code: e.ItemsGroupCode },
              });
              if (getCategory === 0) {
                await public.category_master.create({
                  category: e.U_Type,
                  status: true,
                  created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                  grp_code: e.ItemsGroupCode,
                  last_update: "Y",
                });
              } else {
                await public.category_master.update(
                  {
                    status: true,
                    last_update: "Y",
                  },
                  {
                    where: { grp_code: e.ItemsGroupCode },
                  }
                );
              }
            }
            let getFroupCodeId = await public.category_master.findOne({
              where: { grp_code: e.ItemsGroupCode, status: true },
            });
            console.log(getFroupCodeId.id);
            if (getFroupCodeId) {
              const getSubject = await public.subject_master.count({
                where: { subject: e.U_Subject },
              });

              if (getSubject == 0) {
                await public.subject_master.create({
                  fk_category_id: getFroupCodeId.id,
                  subject: e.U_Subject,
                  status: true,
                  created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                  grp_code: e.ItemsGroupCode,
                  last_update: "Y",
                });
              } else {
                await public.subject_master.update(
                  {
                    status: true,
                    last_update: "Y",
                  },
                  {
                    where: { subject: e.U_Subject },
                  }
                );
              }
              let getSubjectId = await public.subject_master.findOne({
                where: { subject: e.U_Subject, status: true },
              });
              if (getSubjectId) {
                const getSeries = await public.series_master.count({
                  where: { series: e.U_Series, fk_subject_id: getSubjectId.id },
                });
                if (getSeries === 0) {
                  await public.series_master.create({
                    fk_subject_id: getSubjectId.id,
                    series: e.U_Series,
                    status: true,
                    created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                    last_update: "Y",
                  });
                } else {
                  await public.series_master.update(
                    {
                      status: true,
                      last_update: "Y",
                    },
                    {
                      where: {
                        series: e.U_Series,
                        fk_subject_id: getSubjectId.id,
                      },
                    }
                  );
                }
                let getSeriesId = await public.series_master.findOne({
                  where: {
                    series: e.U_Series,
                    fk_subject_id: getSubjectId.id,
                    status: true,
                  },
                });
                if (getSeriesId) {
                  if (e.hasOwnProperty("ItemPrices")) {
                    let itemPrices = e.ItemPrices;
                    if (itemPrices.length != 0) {
                      var itemPrice = 0;
                      await Promise.all(
                        itemPrices.map(async (price) => {
                          if (
                            price.Price > 0 &&
                            price.PriceList == 6 &&
                            price.Price != "" &&
                            price.Price != undefined
                          ) {
                            itemPrice = price.Price;
                          }
                          if (itemPrice == 0) {
                            if (
                              price.Price > 0 &&
                              price.PriceList == 4 &&
                              price.Price != "" &&
                              price.Price != undefined
                            ) {
                              itemPrice = price.Price;
                            }
                          }
                          if (itemPrice != 0) {
                            const getItem = await public.item_master.count({
                              where: {
                                item_code: e.ItemCode,
                                fk_subject_id: getSubjectId.id,
                                fk_series_id: getSeriesId.id,
                              },
                            });
                            if (getItem === 0) {
                              await public.item_master.create({
                                fk_series_id: getSeriesId.id,
                                fk_subject_id: getSubjectId.id,
                                item_name: e.ItemName,
                                item_code: e.ItemCode,
                                currency: "INR",
                                price: itemPrice,
                                status: true,
                                created_by:
                                  "7efff388-33b5-4b6a-9790-7a02a554c189",
                                last_update: "Y",
                                grade: e.U_Grade,
                              });
                            } else {
                              await public.item_master.update(
                                {
                                  item_name: e.ItemName,
                                  price: itemPrice,
                                  status: true,
                                  last_update: "Y",
                                  grade: e.U_Grade,
                                },
                                {
                                  where: {
                                    item_code: e.ItemCode,
                                    fk_subject_id: getSubjectId.id,
                                    fk_series_id: getSeriesId.id,
                                  },
                                }
                              );
                            }
                          }
                        })
                      );
                    }
                  }
                }
              }
            }
          } catch (e) {
            syncJobssLog.error({
              from: "itemsync",
              message: e.message,
              time: Date.now(),
              extra: [e.U_Series, e.U_Subject, e.ItemsGroupCode],
            });
            if (e.message == "Request failed with status code 401") {
              getLogin();
            }
            console.log(e.message);
          }
          // subject
        }
      })
    );

    if (link) {
      InitItemMaster(link);
    } else {
      console.log("update_ N");
      await public.category_master.update(
        { status: false },
        { where: { last_update: "N" } }
      );
      await public.category_master.update(
        { status: true,last_update:"Y" },
        { where: { id: "a899b334-87ce-4f33-a283-44c45f797983" } }
      );
      await public.subject_master.update(
        { status: false },
        { where: { last_update: "N" } }
      );
      await public.subject_master.update(
        { status: true,last_update:"Y" },
        { where: { id: "f5968ac1-aba5-4e50-aa22-1e99f1888906" } }
      );
      await public.series_master.update(
        { status: false },
        { where: { last_update: "N" } }
      );
      await public.series_master.update(
        { status: true,last_update:"Y" },
        { where: { fk_subject_id: "f5968ac1-aba5-4e50-aa22-1e99f1888906" } }
      );
      await public.item_master.update(
        { status: false },
        { where: { last_update: "N" } }
      );
      await public.item_master.update(
        { status: true,last_update:"Y" },
        { where: { fk_subject_id: "f5968ac1-aba5-4e50-aa22-1e99f1888906" } }
      );
      let rm_s = await public.subject_master.findAll({
        attributes: ["id"],
      });
      if (rm_s.length != 0) {
        await Promise.all(
          rm_s.map(async (item) => {
            let series = await public.series_master.findAll({
              attributes: ["id"],
              where: { fk_subject_id: item.id },
            });
            if (series.length == 0) {
              let dl = await public.subject_master.destroy({
                where: { id: item.id },
              });
              if (dl) {
                console.log("delele subject only");
              }
            } else {
              await Promise.all(
                series.map(async (item_series) => {
                  let itemsChk = await public.item_master.count({
                    where: { fk_series_id: item_series.id },
                  });
                  console.log("inside");
                  if (itemsChk == 0) {
                    let dl1 = await public.series_master.destroy({
                      where: { id: item_series.id },
                    });
                    if (dl1) {
                      console.log("series del");
                      let dl2 = await public.subject_master.destroy({
                        where: { id: item.id },
                      });
                      if (dl2) {
                        console.log("delele subject");
                      }
                    }
                  }
                })
              );
            }
          })
        );
        console.log("done !");
      }
    }
    let message = "done";
    return message;
  } catch (e) {
    syncJobssLog.error({
      from: "itemsync",
      message: e.message,
      time: Date.now(),
    });
    console.log(e.message);
  }
};
module.exports = InitItemMaster;
