const public = require("../../models/public");
const qs = require("qs");
const axios = require("axios").default;
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = agent;

let config = {
  headers: {
    apikey: process.env.HR_ONE_apikey,
    domaincode: process.env.HR_ONE_domaincode,
    accesskey: process.env.HR_ONE_accesskey,
    "Content-Type": "application/x-www-form-urlencoded",
  },
};
const syncHrOne = async () => {
  try {
    console.log("syncHRONE");
    const get = await public.hr_one.findAll({
      limit: 150,
      where: { status: true, hr_status: false },
    });
    if (get) {
      await Promise.all(
        get.map(async (item) => {
          let data = qs.stringify({
            Emp_Code: item.emp,
            vehicletypeID: item.vehicle_id,
            convenseDate: item.convense_date,
            kiloMeter: item.kilometer,
            amount: item.amount,
            fromdestination: item.from_destination,
            todestination: item.to_destination,
            description: "from EuphuesOne -- " + item.description,
            ExpenseType: "1",
            PolicyID: "1",
            ProjectCode: null,
            Line_ItemStatus: 0,
            FileName: null,
          });
          axios
            .post(
              process.env.HR_ONE_url + "/api/externalexpense/PostLocalConvense",
              data,
              config
            )
            .then((datas) => {
              console.log(datas.data);
              console.log(item.id);
              (async () => {
                console.log("update data");
                const update = await public.hr_one.update(
                  {
                    hr_status: true,
                    status: true,
                  },
                  {
                    where: { id: item.id },
                  }
                );
                if (!update) {
                  console.log("error");
                }
              })();
            })
            .catch((error) => {
              console.log(error.message);
            });
        })
      );
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = syncHrOne;
