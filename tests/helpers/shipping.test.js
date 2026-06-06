const { calculateShippingFee, getProvinceList, SHIPPING_RATES } = require("../../helpers/shipping");

describe("helpers/shipping", () => {
    describe("calculateShippingFee", () => {
        test("tính phí miền Bắc", () => {
            const result = calculateShippingFee("Hà Nội");
            expect(result.fee).toBe(25000);
            expect(result.region).toBe("north");
            expect(result.regionLabel).toBe("Miền Bắc");
        });
        test("tính phí miền Trung", () => {
            const result = calculateShippingFee("Đà Nẵng");
            expect(result.fee).toBe(35000);
            expect(result.region).toBe("central");
        });
        test("tính phí miền Nam", () => {
            const result = calculateShippingFee("Hồ Chí Minh");
            expect(result.fee).toBe(30000);
            expect(result.region).toBe("south");
        });
        test("trả về phí mặc định khi tỉnh không xác định", () => {
            const result = calculateShippingFee("Mars");
            expect(result.fee).toBe(35000);
            expect(result.region).toBe("unknown");
        });
        test("trả về phí mặc định khi province null/undefined", () => {
            expect(calculateShippingFee(null).fee).toBe(35000);
            expect(calculateShippingFee(undefined).fee).toBe(35000);
        });
        test("xử lý tỉnh có khoảng trắng thừa", () => {
            const result = calculateShippingFee("  Hà Nội  ");
            expect(result.fee).toBe(25000);
        });
        test("case-insensitive", () => {
            const result = calculateShippingFee("hà nội");
            expect(result.fee).toBe(25000);
        });
    });

    describe("getProvinceList", () => {
        test("trả về danh sách tỉnh đã sắp xếp", () => {
            const list = getProvinceList();
            expect(list.length).toBeGreaterThan(0);
            // Kiểm tra sắp xếp
            for (let i = 1; i < list.length; i++) {
                expect(list[i].localeCompare(list[i-1], "vi")).toBeGreaterThanOrEqual(0);
            }
        });
        test("chứa các tỉnh lớn", () => {
            const list = getProvinceList();
            expect(list).toContain("Hà Nội");
            expect(list).toContain("Đà Nẵng");
        });
    });

    describe("SHIPPING_RATES", () => {
        test("có đủ 3 vùng", () => {
            expect(SHIPPING_RATES).toHaveProperty("north");
            expect(SHIPPING_RATES).toHaveProperty("central");
            expect(SHIPPING_RATES).toHaveProperty("south");
        });
    });
});
