const validate = require("../../middlewares/validate.middleware");
const Joi = require("joi");

describe("middlewares/validate", () => {
    let req, res, next;

    const testSchema = Joi.object({
        title: Joi.string().trim().required().messages({
            "string.empty": "Tên không được để trống!",
            "any.required": "Tên không được để trống!"
        }),
        price: Joi.number().min(0).messages({
            "number.base": "Giá phải là số!",
            "number.min": "Giá phải >= 0!"
        })
    });

    beforeEach(() => {
        req = {
            body: {},
            xhr: false,
            headers: { accept: "text/html" },
            flash: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            redirect: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    test("gọi next() khi dữ liệu hợp lệ", () => {
        req.body = { title: "SP1", price: 100 };
        validate(testSchema)(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("flash + redirect khi dữ liệu không hợp lệ (request thường)", () => {
        req.body = { title: "", price: 100 };
        validate(testSchema)(req, res, next);
        expect(req.flash).toHaveBeenCalledWith("error", "Tên không được để trống!");
        expect(res.redirect).toHaveBeenCalledWith("back");
        expect(next).not.toHaveBeenCalled();
    });

    test("trả JSON 400 khi AJAX request không hợp lệ", () => {
        req.xhr = true;
        req.body = { title: "" };
        validate(testSchema)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            code: 400,
            message: "Tên không được để trống!"
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test("trả JSON 400 khi accept header là application/json", () => {
        req.headers.accept = "application/json";
        req.body = { title: "" };
        validate(testSchema)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("cho phép unknown fields (allowUnknown: true)", () => {
        req.body = { title: "SP1", price: 100, extraField: "hello" };
        validate(testSchema)(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("validate lỗi number", () => {
        req.body = { title: "SP1", price: -5 };
        validate(testSchema)(req, res, next);
        expect(req.flash).toHaveBeenCalledWith("error", "Giá phải >= 0!");
        expect(next).not.toHaveBeenCalled();
    });
});
