const sort = require("../../helpers/sort");

describe("helpers/sort", () => {
    // ─── Giá trị mặc định ────────────────────────────────────────────────
    describe("giá trị mặc định", () => {
        test("trả về sortObject mặc định position: -1 khi không có query", () => {
            const result = sort({});
            expect(result.sortObject).toEqual({ position: -1 });
        });

        test("trả về defaultOptions khi không truyền customOptions", () => {
            const result = sort({});
            expect(result.sortOptions).toHaveLength(6);
            expect(result.sortOptions[0].value).toBe("position-desc");
        });
    });

    // ─── Sắp xếp theo query ─────────────────────────────────────────────
    describe("sắp xếp theo query", () => {
        test("sortKey = 'price' và sortValue = 'desc' → { price: -1 }", () => {
            const result = sort({ sortKey: "price", sortValue: "desc" });
            expect(result.sortObject).toEqual({ price: -1 });
        });

        test("sortKey = 'title' và sortValue = 'asc' → { title: 1 }", () => {
            const result = sort({ sortKey: "title", sortValue: "asc" });
            expect(result.sortObject).toEqual({ title: 1 });
        });

        test("chỉ có sortKey mà không có sortValue → mặc định", () => {
            const result = sort({ sortKey: "price" });
            expect(result.sortObject).toEqual({ position: -1 });
        });

        test("chỉ có sortValue mà không có sortKey → mặc định", () => {
            const result = sort({ sortValue: "asc" });
            expect(result.sortObject).toEqual({ position: -1 });
        });
    });

    // ─── Custom sortOptions ──────────────────────────────────────────────
    describe("custom sortOptions", () => {
        test("sử dụng customOptions khi được truyền vào", () => {
            const customOptions = [
                { value: "name-asc", label: "Tên A-Z" },
                { value: "name-desc", label: "Tên Z-A" }
            ];
            const result = sort({}, customOptions);
            expect(result.sortOptions).toEqual(customOptions);
            expect(result.sortOptions).toHaveLength(2);
        });
    });
});
