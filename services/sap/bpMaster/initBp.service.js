require("dotenv").config();
const axios = require("axios").default;
const https = require("https");
const redisClient = require("../../../config/redis.config");
const sales_data = require("../../../models/sales_data");
const locations = require("../../../models/locations");
const users = require("../../../models/users");
const {
  sap_bpMaster_all_Syncs,
  syncJobssLog,
} = require("../../../config/log.config");
const { getLogin, getSapLoginToken } = require("../login.service");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;
const InitBpMaster = async (link) => {
  let config = await getSapLoginToken();
  if (link === "NA") {
    await sales_data.bp_master.update(
      {
        last_update: "N",
      },
      { where: { status: true } }
    );
    const ress = await axios
      .get(
        process.env.sap_URL +
          "/BusinessPartners?$filter=CardType eq 'cCustomer'",
        config
      )
      .catch((e) => console.log(e.message));
    if (ress) {
      let newLink = Object.values(ress.data)[2];
      let data = ress.data;
      await allSync(data, newLink);
    }
  } else if (link && link !== "NA") {
    const ress = await axios
      .get(process.env.sap_URL + "/" + link, config)
      .catch((e) => console.log(e.message));
    if (ress) {
      let newLink = Object.values(ress.data)[2];
      let data = ress.data;
      await allSync(data, newLink);
    }
  }
};

const allSync = async (data, link) => {
  let datas = data.value;
  await Promise.all(
    datas.map(async (e) => {
      if (e.CardType == "cCustomer" && e.Frozen == "tNO") {
        try {
          const bp = await sales_data.bp_master.findOne({
            where: { bp_code: e.CardCode },
          });
          var bpId = "";
          if (!bp) {
            const createBp = await sales_data.bp_master.create({
              bp_name: e.CardName,
              bp_code: e.CardCode,
              bp_group: e.GroupCode,
              cardtype: e.CardType,
              u_link_code: e.U_LINK_CODE,
              phone1: e.Phone1,
              cellular: e.Cellular,
              credit_limit: e.CreditLimit,
              credit_bal: e.CurrentAccountBalance,
              status: true,
              created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
              last_update_date: e.UpdateDate,
              last_updatedat_time: e.UpdateTime,
              last_update: "Y",
            });
            if (!createBp) {
            }
            bpId = createBp.id;
          } else {
            const updateBp = await sales_data.bp_master.update(
              {
                bp_name: e.CardName,
                bp_group: e.GroupCode,
                cardtype: e.CardType,
                u_link_code: e.U_LINK_CODE,
                phone1: e.Phone1,
                cellular: e.Cellular,
                credit_limit: e.CreditLimit,
                credit_bal: e.CurrentAccountBalance,
                status: true,
                created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                last_update_date: e.UpdateDate,
                last_updatedat_time: e.UpdateTime,
                last_update: "Y",
              },
              {
                where: { bp_code: e.CardCode },
              }
            );
            if (!updateBp) {
            }
            bpId = bp.id;
          }
          console.log(bpId);
          if (bpId != "" && bpId != undefined) {
            await sales_data.bp_contact.update(
              {
                status: false,
              },
              {
                where: { fk_bp_id: bpId },
              }
            );
            await sales_data.bp_address.update(
              {
                status: false,
              },
              {
                where: { fk_bp_id: bpId },
              }
            );
            await sales_data.bp_user_tagging.update(
              {
                status: false,
              },
              {
                where: { fk_bp_id: bpId },
              }
            );
            if (e.hasOwnProperty("ContactEmployees")) {
              let contactps = e.ContactEmployees;
              if (contactps.length != 0) {
                await Promise.all(
                  contactps.map(async (cnt) => {
                    const checkCpontact = await sales_data.bp_contact.count({
                      where: {
                        fk_bp_id: bpId,
                        bp_contact_code: "" + cnt.InternalCode + "",
                      },
                    });
                    if (checkCpontact == 0) {
                      const createContact = await sales_data.bp_contact.create({
                        fk_bp_id: bpId,
                        name: cnt.Name,
                        phone: cnt.MobilePhone,
                        email: cnt.E_Mail,
                        bp_contact_code: cnt.InternalCode,
                        status: true,
                        created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                      });
                      if (!createContact) {
                      }
                    } else {
                      const updateContact = await sales_data.bp_contact.update(
                        {
                          name: cnt.Name,
                          phone: cnt.MobilePhone,
                          email: cnt.E_Mail,
                          status: true,
                          created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                        },
                        {
                          where: {
                            fk_bp_id: bpId,
                            bp_contact_code: "" + cnt.InternalCode + "",
                          },
                        }
                      );
                      if (!updateContact) {
                      }
                    }
                  })
                );
              }
            }
            if (e.hasOwnProperty("BPAddresses")) {
              let address = e.BPAddresses;
              if (address.length != 0) {
                let addressdata = await Promise.all(
                  address.map(async (adr) => {
                    let cate = "";
                    if (adr.AddressType == "bo_BillTo") {
                      cate = "B";
                    } else if (adr.AddressType == "bo_ShipTo") {
                      cate = "S";
                    }
                    const contry = await locations.country_master.findOne({
                      where: { code: adr.Country },
                    });
                    if (contry) {
                      const state = await locations.state_master.findOne({
                        where: { code: adr.State },
                      });
                      if (state) {
                        var cityId = "5193dcd2-7183-4417-90c8-95f223afbb71";
                        if (adr.City) {
                          let citNAme = adr.City;
                          let updateCityNme = citNAme
                            .replace("\\", "")
                            .replace("//", "");
                          const city = await locations.city_master.findOne({
                            where: {
                              fk_state_id: state.id,
                              city: updateCityNme,
                            },
                          });
                          if (city) {
                            cityId = city.id;
                          } else {
                            const cityCreate =
                              await locations.city_master.create({
                                city: updateCityNme,
                                fk_state_id: state.id,
                                created_by:
                                  "7efff388-33b5-4b6a-9790-7a02a554c189",
                                status: false,
                              });
                            if (cityCreate) {
                              cityId = cityCreate.id;
                            } else {
                              cityId = "5193dcd2-7183-4417-90c8-95f223afbb71";
                            }
                          }
                        }
                        let newAddress = "";
                        if (adr.AddressName) {
                          newAddress = adr.AddressName;
                        } else {
                          newAddress = "NA";
                        }
                        let newStreet = "";
                        if (adr.Street) {
                          newStreet = adr.Street;
                        } else {
                          newStreet = "NA";
                        }
                        let newBloack = "NA";
                        if (adr.Block) {
                          newBloack = adr.Block;
                        }
                        let gst_no = "NA";
                        if (adr.GSTIN) {
                          gst_no = adr.GSTIN;
                        }
                        let newZipCode = "NA";
                        if (adr.ZipCode) {
                          newZipCode = adr.ZipCode;
                        }
                        const checkAddress = await sales_data.bp_address.count({
                          where: {
                            fk_bp_id: bpId,
                            category: cate,
                            fk_state_id: state.id,
                            fk_city_id: cityId,

                            address: newAddress,
                          },
                        });
                        if (checkAddress == 0) {
                          const createAddress =
                            await sales_data.bp_address.create({
                              fk_bp_id: bpId,
                              category: cate,
                              fk_country_id: contry.id,
                              fk_state_id: state.id,
                              fk_city_id: cityId,
                              gst_no: gst_no,
                              zip_code: newZipCode,
                              street: newStreet,
                              block: newBloack,
                              address: newAddress,
                              status: true,
                              created_by:
                                "7efff388-33b5-4b6a-9790-7a02a554c189",
                            });
                          if (!createAddress) {
                          }
                        } else {
                          const updateAddress = sales_data.bp_address.update(
                            {
                              gst_no: gst_no,
                              zip_code: newZipCode,
                              street: newStreet,
                              block: newBloack,
                              status: true,
                              created_by:
                                "7efff388-33b5-4b6a-9790-7a02a554c189",
                            },
                            {
                              where: {
                                fk_bp_id: bpId,
                                category: cate,
                                fk_state_id: state.id,
                                fk_city_id: cityId,
                                address: newAddress,
                              },
                            }
                          );
                          if (!updateAddress) {
                          }
                        }
                      } else {
                      }
                    } else {
                    }
                  })
                );
              }
            }
            const getUserCode = await users.user_master.findOne({
              where: { SalesPersonCode: e.SalesPersonCode },
            });
            if (getUserCode) {
              const checkTagging = await sales_data.bp_user_tagging.findOne({
                where: { fk_bp_id: bpId, fk_user_id: getUserCode.id },
              });
              if (checkTagging) {
                if (checkTagging.status == false) {
                  const updateUsertagging =
                    await sales_data.bp_user_tagging.update(
                      {
                        status: true,
                      },
                      {
                        where: { fk_bp_id: bpId, fk_user_id: getUserCode.id },
                      }
                    );

                  if (!updateUsertagging) {
                    errors.push({
                      type: "user tagging updateing",
                      bp_code: e.CardCode,
                      message: e.SalesPersonCode,
                    });
                  }
                }
              } else {
                const createUserTagging =
                  await sales_data.bp_user_tagging.create({
                    fk_bp_id: bpId,
                    fk_user_id: getUserCode.id,
                    status: true,
                    created_by: "7efff388-33b5-4b6a-9790-7a02a554c189",
                  });
                if (!createUserTagging) {
                }
              }
            }
          }
        } catch (e) {
          console.log(e.message);

          syncJobssLog.error({
            from: "bpSync",
            message: e.message,
            time: Date.now(),
          });
          if (e.message == "Request failed with status code 401") {
            getLogin();
          }
          console.log(e.message);
        }
      }
    })
  );
  if (link != "") {
    InitBpMaster(link);
  } else {
    await sales_data.bp_master.update(
      { status: false },
      { where: { last_update: "N" } }
    );
  }
  let message = "done";
  return message;
};

module.exports = InitBpMaster;
