const public = require("../../../models/public");
const { Op } = require("sequelize");
const axios = require("axios").default;
const https = require("https");
require("dotenv").config();
const redisClient = require("../../../config/redis.config");
const sales_data = require("../../../models/sales_data");
const locations = require("../../../models/locations");

const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

exports.syncReturn = async () => {
  const get = await public.returns.findAll({
    attributes: ["id"],
    include: [
      {
        attributes: ["id", "bp_code"],
        model: sales_data.bp_master,
        as: "fk_bp",
        include: {
          attributes: ["id", "fk_state_id"],
          model: sales_data.bp_address,
          as: "bp_addresses",
          where: { category: "B" },
          include: {
            attributes: ["id", "state"],
            model: locations.state_master,
            as: "fk_state",
          },
        },
      },
      {
        attributes: ["id", "quantity"],
        model: public.returns_items,
        as: "returns_items",
        include: {
          attributes: ["id", "item_code", "price"],
          model: public.item_master,
          as: "fk_item",
        },
      },
    ],
    where: [],
  });
};

const sync = async (data) => {};
