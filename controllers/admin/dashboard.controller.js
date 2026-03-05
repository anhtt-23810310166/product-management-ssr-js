const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Order = require("../../models/order.model");
const Account = require("../../models/account.model");
const Article = require("../../models/article.model");
const User = require("../../models/user.model");

// [GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
    try {
        // Thống kê tổng quan
        const [
            totalProducts,
            totalCategories,
            totalOrders,
            totalAccounts,
            totalArticles,
            totalUsers,
            pendingOrders,
            confirmedOrders,
            shippingOrders,
            deliveredOrders,
            cancelledOrders
        ] = await Promise.all([
            Product.countDocuments({ deleted: false }),
            ProductCategory.countDocuments({ deleted: false }),
            Order.countDocuments({ deleted: false }),
            Account.countDocuments({ deleted: false }),
            Article.countDocuments({ deleted: false }),
            User.countDocuments({ deleted: false }),
            Order.countDocuments({ deleted: false, status: "pending" }),
            Order.countDocuments({ deleted: false, status: "confirmed" }),
            Order.countDocuments({ deleted: false, status: "shipping" }),
            Order.countDocuments({ deleted: false, status: "delivered" }),
            Order.countDocuments({ deleted: false, status: "cancelled" })
        ]);

        // Tổng doanh thu (đơn đã giao)
        const revenueResult = await Order.aggregate([
            { $match: { deleted: false, status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Đơn hàng mới nhất (5 đơn)
        const recentOrders = await Order
            .find({ deleted: false })
            .sort({ createdAt: -1 })
            .limit(5);

        // Sản phẩm mới nhất (5 sp)
        const recentProducts = await Product
            .find({ deleted: false })
            .sort({ createdAt: -1 })
            .limit(5);

        res.render("admin/pages/dashboard/index", {
            pageTitle: "Dashboard",
            currentPage: "dashboard",
            stats: {
                totalProducts,
                totalCategories,
                totalOrders,
                totalAccounts,
                totalArticles,
                totalUsers,
                totalRevenue,
                pendingOrders,
                confirmedOrders,
                shippingOrders,
                deliveredOrders,
                cancelledOrders
            },
            recentOrders,
            recentProducts
        });
    } catch (error) {
        console.log("Dashboard error:", error);
        res.render("admin/pages/dashboard/index", {
            pageTitle: "Dashboard",
            currentPage: "dashboard",
            stats: {},
            recentOrders: [],
            recentProducts: []
        });
    }
}

// [GET] /admin/dashboard/chart-data
module.exports.chartData = async (req, res) => {
    try {
        const now = new Date();

        // --- 1. Doanh thu 7 ngày gần nhất ---
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    deleted: false,
                    status: "delivered",
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill missing days
        const dailyRevenueMap = {};
        dailyRevenue.forEach(d => { dailyRevenueMap[d._id] = d; });

        const dailyLabels = [];
        const dailyData = [];
        const dailyOrderCount = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split("T")[0];
            const label = `${date.getDate()}/${date.getMonth() + 1}`;
            dailyLabels.push(label);
            dailyData.push(dailyRevenueMap[key] ? dailyRevenueMap[key].total : 0);
            dailyOrderCount.push(dailyRevenueMap[key] ? dailyRevenueMap[key].count : 0);
        }

        // --- 2. Doanh thu 12 tháng gần nhất ---
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    deleted: false,
                    status: "delivered",
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthlyRevenueMap = {};
        monthlyRevenue.forEach(m => {
            const key = `${m._id.year}-${String(m._id.month).padStart(2, "0")}`;
            monthlyRevenueMap[key] = m;
        });

        const monthlyLabels = [];
        const monthlyData = [];
        const monthlyOrderCount = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const label = `T${date.getMonth() + 1}/${date.getFullYear()}`;
            monthlyLabels.push(label);
            monthlyData.push(monthlyRevenueMap[key] ? monthlyRevenueMap[key].total : 0);
            monthlyOrderCount.push(monthlyRevenueMap[key] ? monthlyRevenueMap[key].count : 0);
        }

        // --- 3. Top 5 sản phẩm bán chạy ---
        const topProducts = await Order.aggregate([
            { $match: { deleted: false, status: "delivered" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    title: { $first: "$items.title" },
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.itemTotal" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // --- 4. Phân bổ đơn hàng theo trạng thái ---
        const ordersByStatus = await Order.aggregate([
            { $match: { deleted: false } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusLabels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            shipping: "Đang giao",
            delivered: "Đã giao",
            cancelled: "Đã hủy"
        };
        const statusColors = {
            pending: "#f9a825",
            confirmed: "#1976d2",
            shipping: "#ef6c00",
            delivered: "#2e7d32",
            cancelled: "#c62828"
        };

        const orderStatusData = {
            labels: [],
            data: [],
            colors: []
        };

        const statusOrder = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
        const statusMap = {};
        ordersByStatus.forEach(s => { statusMap[s._id] = s.count; });

        statusOrder.forEach(status => {
            orderStatusData.labels.push(statusLabels[status]);
            orderStatusData.data.push(statusMap[status] || 0);
            orderStatusData.colors.push(statusColors[status]);
        });

        // --- 5. Phân bổ theo phương thức thanh toán ---
        const ordersByPayment = await Order.aggregate([
            { $match: { deleted: false } },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 }
                }
            }
        ]);

        const paymentLabels = { cod: "COD", vnpay: "VNPay" };
        const paymentColors = { cod: "#3e97ff", vnpay: "#7239ea" };
        const paymentData = {
            labels: [],
            data: [],
            colors: []
        };

        ordersByPayment.forEach(p => {
            paymentData.labels.push(paymentLabels[p._id] || p._id);
            paymentData.data.push(p.count);
            paymentData.colors.push(paymentColors[p._id] || "#a1a5b7");
        });

        res.json({
            code: 200,
            data: {
                dailyRevenue: { labels: dailyLabels, data: dailyData, orderCount: dailyOrderCount },
                monthlyRevenue: { labels: monthlyLabels, data: monthlyData, orderCount: monthlyOrderCount },
                topProducts,
                orderStatus: orderStatusData,
                paymentMethod: paymentData
            }
        });
    } catch (error) {
        console.log("Chart data error:", error);
        res.json({ code: 500, message: "Lỗi tải dữ liệu biểu đồ" });
    }
}