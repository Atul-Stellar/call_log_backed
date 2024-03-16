const { Joi } = require("express-validation");

exports.callLogStoreSchema = {
    body:  Joi.array().items(
      Joi.object({
          number: Joi.string().required(),
          fk_call_type: Joi.number().required(),
          duration: Joi.number().required(),
          name: Joi.string().required(),
          date: Joi.date().iso().required(),
          time: Joi.string().required()
      })
    )
};