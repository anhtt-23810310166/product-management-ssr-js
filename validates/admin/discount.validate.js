const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const discountSchema = Joi.object({
    code: Joi.string().trim().required().messages({
        "string.empty": "Mã giảm giá không được để trống!",
        "any.required": "Mã giảm giá không được để trống!"
    }),
    description: Joi.string().allow("", null).optional(),
    type: Joi.string().valid("percentage", "fixed").default("percentage").messages({
        "any.only": "Loại giảm giá không hợp lệ!"
    }),
    value: Joi.number().min(1).required().messages({
        "number.base": "Giá trị giảm phải là số!",
        "number.min": "Giá trị giảm phải lớn hơn 0!",
        "any.required": "Giá trị giảm không được để trống!"
    }),
    minOrder: Joi.number().min(0).default(0),
    maxDiscount: Joi.number().min(0).default(0),
    usageLimit: Joi.number().min(0).default(0),
    startDate: Joi.date().optional().allow("", null),
    endDate: Joi.date().required().messages({
        "date.base": "Ngày hết hạn không hợp lệ!",
        "any.required": "Vui lòng chọn ngày hết hạn!"
    }),
    status: Joi.string().valid("active", "inactive").default("active")
});

module.exports.createPost = validate(discountSchema);
module.exports.editPatch = validate(discountSchema);
