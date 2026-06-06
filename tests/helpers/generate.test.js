const { generateRandomString, generateRandomNumber } = require("../../helpers/generate");

describe("helpers/generate", () => {
    // ─── generateRandomString ───────────────────────────────────────────
    describe("generateRandomString", () => {
        test("trả về chuỗi có độ dài đúng yêu cầu", () => {
            expect(generateRandomString(10)).toHaveLength(10);
            expect(generateRandomString(0)).toHaveLength(0);
            expect(generateRandomString(1)).toHaveLength(1);
            expect(generateRandomString(50)).toHaveLength(50);
        });

        test("chỉ chứa ký tự chữ cái và số", () => {
            const result = generateRandomString(100);
            expect(result).toMatch(/^[A-Za-z0-9]+$/);
        });

        test("hai lần gọi trả về kết quả khác nhau (xác suất cao)", () => {
            const a = generateRandomString(20);
            const b = generateRandomString(20);
            // Rất khó trùng nhau với 20 ký tự
            expect(a).not.toEqual(b);
        });

        test("trả về chuỗi rỗng khi length = 0", () => {
            expect(generateRandomString(0)).toBe("");
        });
    });

    // ─── generateRandomNumber ───────────────────────────────────────────
    describe("generateRandomNumber", () => {
        test("trả về chuỗi số có độ dài đúng yêu cầu", () => {
            expect(generateRandomNumber(6)).toHaveLength(6);
            expect(generateRandomNumber(0)).toHaveLength(0);
            expect(generateRandomNumber(4)).toHaveLength(4);
        });

        test("chỉ chứa ký tự số 0-9", () => {
            const result = generateRandomNumber(50);
            expect(result).toMatch(/^[0-9]+$/);
        });

        test("hai lần gọi trả về kết quả khác nhau (xác suất cao)", () => {
            const a = generateRandomNumber(10);
            const b = generateRandomNumber(10);
            expect(a).not.toEqual(b);
        });

        test("trả về chuỗi rỗng khi length = 0", () => {
            expect(generateRandomNumber(0)).toBe("");
        });
    });
});
