const Order = require("../models/order.model");
const Product = require("../models/product.model");

/**
 * Lấy danh sách sản phẩm thường được mua kèm với productId
 * Phân tích lịch sử đơn hàng: tìm sản phẩm xuất hiện cùng nhau nhiều nhất
 * @param {string} productId
 * @param {number} limit
 * @returns {Array} danh sách sản phẩm
 */
async function getFrequentlyBought(productId, limit = 4) {
    try {
        const productIdStr = productId.toString();

        // Tìm đơn hàng chứa sản phẩm này
        const orders = await Order.find({
            "items.productId": productIdStr,
            status: { $ne: "cancelled" },
            deleted: false
        }).select("items");

        if (!orders.length) return [];

        // Đếm tần suất xuất hiện cùng nhau
        const frequencyMap = {};
        for (const order of orders) {
            for (const item of order.items) {
                if (item.productId !== productIdStr) {
                    frequencyMap[item.productId] = (frequencyMap[item.productId] || 0) + 1;
                }
            }
        }

        // Sắp xếp theo tần suất giảm dần, lấy top N
        const sortedIds = Object.entries(frequencyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        if (!sortedIds.length) return [];

        const products = await Product.find({
            _id: { $in: sortedIds },
            status: "active",
            deleted: false,
            stock: { $gt: 0 }
        }).lean();

        return products;
    } catch (error) {
        console.log("getFrequentlyBought error:", error);
        return [];
    }
}

module.exports = getFrequentlyBought;
