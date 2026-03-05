const User = require("../models/user.model");

// Tỷ lệ tích điểm: 1% giá trị đơn hàng (100.000đ = 1 điểm)
const POINTS_PER_VND = 100000; // Mỗi 100k = 1 điểm
const REDEEM_VALUE = 10000;     // 1 điểm = 10.000đ giảm giá
const MAX_REDEEM_PERCENT = 0.10; // Tối đa dùng 10% giá trị đơn

/**
 * Cộng điểm sau khi đơn hàng giao thành công
 * @param {string} userId
 * @param {number} orderAmount - Giá trị đơn hàng (VND)
 * @returns {number} Số điểm đã cộng
 */
async function addPoints(userId, orderAmount) {
    if (!userId || !orderAmount || orderAmount <= 0) return 0;
    const pointsEarned = Math.floor(orderAmount / POINTS_PER_VND);
    if (pointsEarned <= 0) return 0;

    await User.updateOne(
        { _id: userId },
        { $inc: { loyaltyPoints: pointsEarned } }
    );
    return pointsEarned;
}

/**
 * Tính số điểm tối đa có thể dùng cho đơn hàng
 * @param {number} orderAmount
 * @param {number} availablePoints
 * @returns {number} Số điểm có thể dùng
 */
function calcMaxRedeemPoints(orderAmount, availablePoints) {
    const maxByPercent = Math.floor((orderAmount * MAX_REDEEM_PERCENT) / REDEEM_VALUE);
    return Math.min(maxByPercent, availablePoints);
}

/**
 * Tính số tiền giảm từ điểm
 * @param {number} points
 * @returns {number} Số tiền giảm (VND)
 */
function calcRedeemAmount(points) {
    return points * REDEEM_VALUE;
}

/**
 * Trừ điểm khi sử dụng
 * @param {string} userId
 * @param {number} points
 */
async function redeemPoints(userId, points) {
    if (!userId || !points || points <= 0) return;
    await User.updateOne(
        { _id: userId, loyaltyPoints: { $gte: points } },
        { $inc: { loyaltyPoints: -points } }
    );
}

/**
 * Lấy số điểm hiện có
 * @param {string} userId
 * @returns {number}
 */
async function getPoints(userId) {
    if (!userId) return 0;
    const user = await User.findById(userId).select("loyaltyPoints");
    return user ? (user.loyaltyPoints || 0) : 0;
}

module.exports = {
    addPoints,
    redeemPoints,
    calcMaxRedeemPoints,
    calcRedeemAmount,
    getPoints,
    POINTS_PER_VND,
    REDEEM_VALUE,
    MAX_REDEEM_PERCENT
};
