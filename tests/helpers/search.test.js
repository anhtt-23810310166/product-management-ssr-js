const search = require("../../helpers/search");

describe("helpers/search", () => {
    test("trả về keyword rỗng và regex rỗng khi không có keyword", () => {
        const result = search({});
        expect(result.keyword).toBe("");
        expect(result.regex).toBe("");
    });

    test("trả về keyword rỗng khi query không có keyword property", () => {
        const result = search({ page: "1" });
        expect(result.keyword).toBe("");
        expect(result.regex).toBe("");
    });

    test("trả về keyword và regex đúng khi có keyword", () => {
        const result = search({ keyword: "điện thoại" });
        expect(result.keyword).toBe("điện thoại");
        expect(result.regex).toBeInstanceOf(RegExp);
    });

    test("regex là case-insensitive (flag 'i')", () => {
        const result = search({ keyword: "Samsung" });
        expect(result.regex.flags).toContain("i");
    });

    test("regex khớp đúng keyword (case-insensitive)", () => {
        const result = search({ keyword: "iPhone" });
        expect(result.regex.test("iphone 15")).toBe(true);
        expect(result.regex.test("IPHONE Pro")).toBe(true);
        expect(result.regex.test("Samsung Galaxy")).toBe(false);
    });

    test("xử lý keyword là chuỗi rỗng", () => {
        const result = search({ keyword: "" });
        // falsy keyword => không tạo regex
        expect(result.keyword).toBe("");
        expect(result.regex).toBe("");
    });
});
