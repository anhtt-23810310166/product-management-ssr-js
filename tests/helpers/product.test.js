const { getDiscountedPrice, getCartTotalQuantity, calculateCartTotal } = require("../../helpers/product");

describe("helpers/product", () => {
    describe("getDiscountedPrice", () => {
        test("trả về giá gốc khi không có giảm giá", () => {
            expect(getDiscountedPrice({ price: 10000000 })).toBe(10000000);
        });
        test("tính giá giảm 10%", () => {
            expect(getDiscountedPrice({ price: 10000000, discountPercentage: 10 })).toBe(9000000);
        });
        test("làm tròn đến hàng nghìn", () => {
            const result = getDiscountedPrice({ price: 999999, discountPercentage: 13 });
            expect(result % 1000).toBe(0);
        });
        test("sử dụng giá variant khi variant.price > 0", () => {
            expect(getDiscountedPrice({ price: 10000000, discountPercentage: 10 }, { price: 12000000 })).toBe(10800000);
        });
        test("dùng giá gốc khi variant.price = 0", () => {
            expect(getDiscountedPrice({ price: 10000000, discountPercentage: 10 }, { price: 0 })).toBe(9000000);
        });
        test("giảm 100% → giá = 0", () => {
            expect(getDiscountedPrice({ price: 5000000, discountPercentage: 100 })).toBe(0);
        });
    });

    describe("getCartTotalQuantity", () => {
        test("tính tổng số lượng đúng", () => {
            expect(getCartTotalQuantity([{ quantity: 2 }, { quantity: 3 }])).toBe(5);
        });
        test("trả về 0 khi giỏ hàng rỗng", () => {
            expect(getCartTotalQuantity([])).toBe(0);
        });
    });

    describe("calculateCartTotal", () => {
        test("tính tổng tiền đúng", () => {
            const cart = [{ productId: "p1", quantity: 2 }];
            const products = [{ id: "p1", price: 500000 }];
            expect(calculateCartTotal(cart, products)).toBe(1000000);
        });
        test("bỏ qua sản phẩm không tìm thấy", () => {
            expect(calculateCartTotal([{ productId: "x", quantity: 2 }], [{ id: "p1", price: 500000 }])).toBe(0);
        });
        test("trả về 0 khi giỏ hàng rỗng", () => {
            expect(calculateCartTotal([], [])).toBe(0);
        });
    });
});
