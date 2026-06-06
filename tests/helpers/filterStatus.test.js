const filterStatus = require("../../helpers/filterStatus");

describe("helpers/filterStatus", () => {
    test("trả về 3 mục trạng thái", () => {
        const result = filterStatus({});
        expect(result).toHaveLength(3);
    });

    test("mặc định đánh dấu 'Tất cả trạng thái' là active", () => {
        const result = filterStatus({});
        expect(result[0].class).toBe("active");
        expect(result[1].class).toBe("");
        expect(result[2].class).toBe("");
    });

    test("đánh dấu 'Hoạt động' khi query.status = 'active'", () => {
        const result = filterStatus({ status: "active" });
        expect(result[0].class).toBe("");
        expect(result[1].class).toBe("active");
        expect(result[1].status).toBe("active");
    });

    test("đánh dấu 'Dừng hoạt động' khi query.status = 'inactive'", () => {
        const result = filterStatus({ status: "inactive" });
        expect(result[0].class).toBe("");
        expect(result[2].class).toBe("active");
        expect(result[2].status).toBe("inactive");
    });

    test("đánh dấu 'Tất cả' khi query.status không hợp lệ", () => {
        const result = filterStatus({ status: "unknown_status" });
        expect(result[0].class).toBe("active");
    });

    test("cấu trúc mỗi item chứa name, status, class", () => {
        const result = filterStatus({});
        result.forEach(item => {
            expect(item).toHaveProperty("name");
            expect(item).toHaveProperty("status");
            expect(item).toHaveProperty("class");
        });
    });

    test("item đầu tiên luôn là 'Tất cả trạng thái' với status rỗng", () => {
        const result = filterStatus({});
        expect(result[0].name).toBe("Tất cả trạng thái");
        expect(result[0].status).toBe("");
    });
});
