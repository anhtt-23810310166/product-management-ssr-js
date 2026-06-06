// Set env vars before requiring module
process.env.VNPAY_TMN_CODE = "TESTCODE";
process.env.VNPAY_HASH_SECRET = "TESTHASHSECRET123456789";
process.env.VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
process.env.VNPAY_RETURN_URL = "http://localhost:3000/cart/vnpay-return";

const { createPaymentUrl, verifyReturnUrl } = require("../../helpers/vnpay");

describe("helpers/vnpay", () => {
    describe("createPaymentUrl", () => {
        test("trả về object có paymentUrl và txnRef", () => {
            const result = createPaymentUrl("ORDER123", 500000, "127.0.0.1");
            expect(result).toHaveProperty("paymentUrl");
            expect(result).toHaveProperty("txnRef");
        });

        test("paymentUrl bắt đầu bằng VNPay URL", () => {
            const result = createPaymentUrl("ORDER123", 500000, "127.0.0.1");
            expect(result.paymentUrl).toContain("https://sandbox.vnpayment.vn");
        });

        test("txnRef chứa orderId", () => {
            const result = createPaymentUrl("ORDER123", 500000, "127.0.0.1");
            expect(result.txnRef).toContain("ORDER123");
        });

        test("amount nhân 100 trong URL", () => {
            const result = createPaymentUrl("ORDER1", 500000, "127.0.0.1");
            expect(result.paymentUrl).toContain("50000000"); // 500000 * 100
        });

        test("URL chứa SecureHash", () => {
            const result = createPaymentUrl("ORDER1", 500000, "127.0.0.1");
            expect(result.paymentUrl).toContain("vnp_SecureHash");
        });

        test("thêm bankCode nếu có", () => {
            const result = createPaymentUrl("ORDER1", 500000, "127.0.0.1", "NCB");
            expect(result.paymentUrl).toContain("vnp_BankCode=NCB");
        });
    });

    describe("verifyReturnUrl", () => {
        test("xác minh chữ ký đúng", () => {
            // Tạo URL rồi lấy params để verify lại
            const crypto = require("crypto");
            const qs = require("qs");

            const params = {
                vnp_Amount: "50000000",
                vnp_ResponseCode: "00",
                vnp_TxnRef: "ORDER1_123"
            };

            const sorted = {};
            Object.keys(params).sort().forEach(key => {
                sorted[key] = encodeURIComponent(params[key]).replace(/%20/g, "+");
            });

            const signData = qs.stringify(sorted, { encode: false });
            const hmac = crypto.createHmac("sha512", process.env.VNPAY_HASH_SECRET);
            const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

            const vnpParams = { ...sorted, vnp_SecureHash: signed };
            expect(verifyReturnUrl(vnpParams)).toBe(true);
        });

        test("trả false khi chữ ký sai", () => {
            const params = {
                vnp_Amount: "50000000",
                vnp_ResponseCode: "00",
                vnp_SecureHash: "invalid_hash"
            };
            expect(verifyReturnUrl(params)).toBe(false);
        });
    });
});
