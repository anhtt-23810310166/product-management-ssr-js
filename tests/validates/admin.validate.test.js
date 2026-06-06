const Joi = require("joi");

// Tái tạo schemas trực tiếp để test
const productSchema = Joi.object({
    title: Joi.string().trim().required(),
    price: Joi.number().min(0).allow("", null),
    discountPercentage: Joi.number().min(0).max(100).allow("", null),
    stock: Joi.number().min(0).allow("", null),
    position: Joi.number().min(1).allow("", null)
});

const accountCreateSchema = Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required()
});

const accountEditSchema = Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().trim().email().required()
});

const discountSchema = Joi.object({
    code: Joi.string().trim().required(),
    type: Joi.string().valid("percentage", "fixed").default("percentage"),
    value: Joi.number().min(1).required(),
    endDate: Joi.date().required()
});

describe("validates/admin/product", () => {
    test("hợp lệ khi đủ dữ liệu", () => {
        const { error } = productSchema.validate({ title: "iPhone 15", price: 25000000 }, { allowUnknown: true });
        expect(error).toBeUndefined();
    });
    test("lỗi khi thiếu title", () => {
        const { error } = productSchema.validate({ price: 100 }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi giá âm", () => {
        const { error } = productSchema.validate({ title: "SP1", price: -1 }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi discountPercentage > 100", () => {
        const { error } = productSchema.validate({ title: "SP1", discountPercentage: 150 }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("hợp lệ khi discountPercentage = 0", () => {
        const { error } = productSchema.validate({ title: "SP1", discountPercentage: 0 }, { allowUnknown: true });
        expect(error).toBeUndefined();
    });
    test("lỗi khi stock âm", () => {
        const { error } = productSchema.validate({ title: "SP1", stock: -10 }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi position < 1", () => {
        const { error } = productSchema.validate({ title: "SP1", position: 0 }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
});

describe("validates/admin/account - Create", () => {
    test("hợp lệ khi đủ dữ liệu", () => {
        const { error } = accountCreateSchema.validate({
            fullName: "Admin", email: "admin@test.com", password: "123456"
        }, { allowUnknown: true });
        expect(error).toBeUndefined();
    });
    test("lỗi khi thiếu fullName", () => {
        const { error } = accountCreateSchema.validate({
            email: "admin@test.com", password: "123456"
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi email không hợp lệ", () => {
        const { error } = accountCreateSchema.validate({
            fullName: "Admin", email: "not-email", password: "123456"
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi thiếu password", () => {
        const { error } = accountCreateSchema.validate({
            fullName: "Admin", email: "admin@test.com"
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
});

describe("validates/admin/account - Edit", () => {
    test("hợp lệ không cần password", () => {
        const { error } = accountEditSchema.validate({
            fullName: "Admin Updated", email: "admin@test.com"
        }, { allowUnknown: true });
        expect(error).toBeUndefined();
    });
});

describe("validates/admin/discount", () => {
    test("hợp lệ khi đủ dữ liệu", () => {
        const { error } = discountSchema.validate({
            code: "SALE50", value: 50, endDate: "2026-12-31"
        }, { allowUnknown: true });
        expect(error).toBeUndefined();
    });
    test("lỗi khi thiếu code", () => {
        const { error } = discountSchema.validate({
            value: 50, endDate: "2026-12-31"
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi value < 1", () => {
        const { error } = discountSchema.validate({
            code: "SALE", value: 0, endDate: "2026-12-31"
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi type không hợp lệ", () => {
        const { error } = discountSchema.validate({
            code: "SALE", value: 10, type: "invalid", endDate: "2026-12-31"
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
    test("lỗi khi thiếu endDate", () => {
        const { error } = discountSchema.validate({
            code: "SALE", value: 10
        }, { allowUnknown: true });
        expect(error).toBeDefined();
    });
});
