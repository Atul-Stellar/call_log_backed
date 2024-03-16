const { Joi } = require("express-validation");
exports.RegisterAdminValidator = {
  body: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(3).required(),
    phone: Joi.string().min(10).max(10).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required(),
  }),
};
exports.LoginAdminValidator = {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().min(6).required(),
    }),
  };

  exports.RegisterEmpValidator = {
    body: Joi.object({
      email: Joi.string().email().required(),
      status:Joi.boolean().required(),
      name: Joi.string().min(3).required(),
      fk_gender_id:Joi.number().required(),
      phone: Joi.string().min(10).max(10).required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required(),
    }),
  };