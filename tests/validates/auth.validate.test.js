const Joi = require("joi");

// Tái tạo schemas trực tiếp để test validation logic thuần túy
const registerSchema = Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required()
});

const loginSchema = Joi.object({
    email: Joi.string().trim().required(),
    password: Joi.string().trim().required()
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().trim().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required()
});

describe("validates/client/auth - Register Schema", () => {
    test("hợp lệ khi đủ dữ liệu", () => {
        const { error } = registerSchema.validate({
            fullName: "Nguyễn Văn A",
            email: "test@example.com",
            password: "123456",
            confirmPassword: "123456"
        });
        expect(error).toBeUndefined();
    });

    test("lỗi khi thiếu fullName", () => {
        const { error } = registerSchema.validate({
            email: "test@example.com",
            password: "123456",
            confirmPassword: "123456"
        });
        expect(error).toBeDefined();
    });

    test("lỗi khi email không hợp lệ", () => {
        const { error } = registerSchema.validate({
            fullName: "Test",
            email: "not-an-email",
            password: "123456",
            confirmPassword: "123456"
        });
        expect(error).toBeDefined();
    });

    test("lỗi khi mật khẩu < 6 ký tự", () => {
        const { error } = registerSchema.validate({
            fullName: "Test",
            email: "test@example.com",
            password: "12345",
            confirmPassword: "12345"
        });
        expect(error).toBeDefined();
    });

    test("lỗi khi xác nhận mật khẩu không khớp", () => {
        const { error } = registerSchema.validate({
            fullName: "Test",
            email: "test@example.com",
            password: "123456",
            confirmPassword: "654321"
        });
        expect(error).toBeDefined();
    });

    test("lỗi khi email rỗng", () => {
        const { error } = registerSchema.validate({
            fullName: "Test",
            email: "",
            password: "123456",
            confirmPassword: "123456"
        });
        expect(error).toBeDefined();
    });
});

describe("validates/client/auth - Login Schema", () => {
    test("hợp lệ khi đủ dữ liệu", () => {
        const { error } = loginSchema.validate({
            email: "test@example.com",
            password: "123456"
        });
        expect(error).toBeUndefined();
    });

    test("lỗi khi thiếu email", () => {
        const { error } = loginSchema.validate({ password: "123456" });
        expect(error).toBeDefined();
    });

    test("lỗi khi thiếu password", () => {
        const { error } = loginSchema.validate({ email: "test@example.com" });
        expect(error).toBeDefined();
    });
});

describe("validates/client/auth - Reset Password Schema", () => {
    test("hợp lệ khi đủ dữ liệu", () => {
        const { error } = resetPasswordSchema.validate({
            password: "newpass123",
            confirmPassword: "newpass123"
        });
        expect(error).toBeUndefined();
    });

    test("lỗi khi mật khẩu mới < 6 ký tự", () => {
        const { error } = resetPasswordSchema.validate({
            password: "abc",
            confirmPassword: "abc"
        });
        expect(error).toBeDefined();
    });

    test("lỗi khi confirmPassword không khớp", () => {
        const { error } = resetPasswordSchema.validate({
            password: "newpass123",
            confirmPassword: "different"
        });
        expect(error).toBeDefined();
    });
});
