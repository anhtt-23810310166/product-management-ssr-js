const pagination = require("../../helpers/pagination");

describe("helpers/pagination", () => {
    // ─── Giá trị mặc định ────────────────────────────────────────────────
    describe("giá trị mặc định", () => {
        test("trả về trang 1 khi không có query.page", () => {
            const result = pagination({}, 20);
            expect(result.currentPage).toBe(1);
        });

        test("limitItems mặc định là 4", () => {
            const result = pagination({}, 20);
            expect(result.limitItems).toBe(4);
        });

        test("skip mặc định là 0 khi ở trang 1", () => {
            const result = pagination({}, 20);
            expect(result.skip).toBe(0);
        });
    });

    // ─── Tính totalPage ──────────────────────────────────────────────────
    describe("tính totalPage", () => {
        test("tính đúng totalPage khi chia hết", () => {
            const result = pagination({}, 20, 4);
            expect(result.totalPage).toBe(5);
        });

        test("làm tròn lên khi không chia hết", () => {
            const result = pagination({}, 21, 4);
            expect(result.totalPage).toBe(6);
        });

        test("totalPage = 1 khi totalItems <= limitItems", () => {
            const result = pagination({}, 3, 4);
            expect(result.totalPage).toBe(1);
        });

        test("totalPage = 0 khi không có items", () => {
            const result = pagination({}, 0, 4);
            expect(result.totalPage).toBe(0);
        });
    });

    // ─── Chuyển trang ────────────────────────────────────────────────────
    describe("chuyển trang", () => {
        test("chuyển đến trang chỉ định", () => {
            const result = pagination({ page: "3" }, 20, 4);
            expect(result.currentPage).toBe(3);
            expect(result.skip).toBe(8); // (3-1) * 4
        });

        test("giới hạn currentPage không vượt totalPage", () => {
            const result = pagination({ page: "100" }, 20, 4);
            expect(result.currentPage).toBe(5); // totalPage = 5
        });

        test("giới hạn currentPage không nhỏ hơn 1", () => {
            const result = pagination({ page: "-5" }, 20, 4);
            expect(result.currentPage).toBe(1);
        });

        test("xử lý page không phải số", () => {
            const result = pagination({ page: "abc" }, 20, 4);
            expect(result.currentPage).toBe(1);
        });
    });

    // ─── Skip ────────────────────────────────────────────────────────────
    describe("tính skip", () => {
        test("skip đúng ở trang 2", () => {
            const result = pagination({ page: "2" }, 20, 4);
            expect(result.skip).toBe(4);
        });

        test("skip đúng ở trang cuối", () => {
            const result = pagination({ page: "5" }, 20, 4);
            expect(result.skip).toBe(16);
        });
    });

    // ─── Custom limitItems ───────────────────────────────────────────────
    describe("custom limitItems", () => {
        test("sử dụng limitItems tùy chỉnh", () => {
            const result = pagination({}, 100, 10);
            expect(result.limitItems).toBe(10);
            expect(result.totalPage).toBe(10);
        });
    });

    // ─── totalItems ──────────────────────────────────────────────────────
    describe("totalItems", () => {
        test("lưu đúng totalItems", () => {
            const result = pagination({}, 42, 4);
            expect(result.totalItems).toBe(42);
        });
    });
});
