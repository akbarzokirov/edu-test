const Joi = require("joi");

const validateUser = (user) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),

    role: Joi.string()
      .valid("student", "admin", "teacher")
      .default("student"),
  });

  return schema.validate(user);
};

const validateUpdateUser = (user) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(6),

    role: Joi.string().valid("student", "admin", "teacher"),
  });

  return schema.validate(user);
};

module.exports = { validateUser, validateUpdateUser };