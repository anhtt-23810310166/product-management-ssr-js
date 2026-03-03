const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const flashSaleSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": "Tên chương trình không được để trống!",
        "any.required": "Tên chương trình không được để trống!"
    }),
    startTime: Joi.date().required().messages({
        "date.base": "Thời gian bắt đầu không hợp lệ!",
        "any.required": "Vui lòng chọn thời gian bắt đầu!"
    }),
    endTime: Joi.date().greater(Joi.ref("startTime")).required().messages({
        "date.base": "Thời gian kết thúc không hợp lệ!",
        "any.required": "Vui lòng chọn thời gian kết thúc!",
        "date.greater": "Thời gian kết thúc phải sau thời gian bắt đầu!"
    }),
    status: Joi.string().valid("active", "inactive").default("active"),
    productIds: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    ).optional().allow("", null),
    productDiscounts: Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
    ).optional().allow("", null),
    productStocks: Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
    ).optional().allow("", null)
});

module.exports.createPost = validate(flashSaleSchema);
module.exports.editPatch = validate(flashSaleSchema);
