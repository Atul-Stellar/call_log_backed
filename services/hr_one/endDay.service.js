var moment = require("moment");
const public = require("../../models/public");
const sequelize = require("sequelize");

const endDayAuto = async () => {
  try {
    let today = moment
      .tz("Asia/Calcutta")
      .utcOffset("+0530")
      .format("YYYY-MM-DD");
    const AllStartDayUsers = await public.user_day.findAll({
      attributes: ["id", "fk_user_id"],
      where: [
        sequelize.where(
          sequelize.cast(sequelize.col("createdAt"), "Date"),
          ">=",
          today
        ),
      ],
    });
    if (AllStartDayUsers.length != 0) {
      await Promise.all(
        AllStartDayUsers.map(async (item) => {
          let endDay = await public.user_day.count({
            where: [
              sequelize.where(
                sequelize.cast(sequelize.col("createdAt"), "Date"),
                ">=",
                today
              ),
              { fk_user_id: item.fk_user_id, category: "end" },
            ],
          });
          console.log(endDay);
          if (endDay == 0) {
            const create = await public.user_day.create({
              fk_user_id: item.fk_user_id,
              category: "end",
              coordinates: [
                { lat: "", lon: "" },
                { lat: "", lon: "" },
                { lat: "", lon: "" },
              ],
            });
            if (!create) {
              console.log({
                status: "error",
                message: "server error",
                from: "autoendday",
              });
            }
          }
        })
      );
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = endDayAuto;
