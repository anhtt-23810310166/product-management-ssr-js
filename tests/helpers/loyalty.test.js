const { calcMaxRedeemPoints, calcRedeemAmount, POINTS_PER_VND, REDEEM_VALUE, MAX_REDEEM_PERCENT } = require("../../helpers/loyalty");

describe("helpers/loyalty (pure functions)", () => {
    describe("constants", () => {
        test("POINTS_PER_VND = 100000", () => {
            expect(POINTS_PER_VND).toBe(100000);
        });
        test("REDEEM_VALUE = 10000", () => {
            expect(REDEEM_VALUE).toBe(10000);
        });
        test("MAX_REDEEM_PERCENT = 0.10", () => {
            expect(MAX_REDEEM_PERCENT).toBe(0.10);
        });
    });

    describe("calcMaxRedeemPoints", () => {
        test("tính đúng khi đủ điểm", () => {
            // orderAmount = 1000000, 10% = 100000, 100000/10000 = 10 điểm tối đa
            // availablePoints = 20 → min(10, 20) = 10
            expect(calcMaxRedeemPoints(1000000, 20)).toBe(10);
        });
        test("giới hạn theo số điểm hiện có", () => {
            // orderAmount = 1000000 → max 10 điểm
            // availablePoints = 5 → min(10, 5) = 5
            expect(calcMaxRedeemPoints(1000000, 5)).toBe(5);
        });
        test("trả về 0 khi không có điểm", () => {
            expect(calcMaxRedeemPoints(1000000, 0)).toBe(0);
        });
        test("trả về 0 khi đơn hàng = 0", () => {
            expect(calcMaxRedeemPoints(0, 100)).toBe(0);
        });
    });

    describe("calcRedeemAmount", () => {
        test("1 điểm = 10.000đ", () => {
            expect(calcRedeemAmount(1)).toBe(10000);
        });
        test("5 điểm = 50.000đ", () => {
            expect(calcRedeemAmount(5)).toBe(50000);
        });
        test("0 điểm = 0đ", () => {
            expect(calcRedeemAmount(0)).toBe(0);
        });
    });
});
