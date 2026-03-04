const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const orderService = require("../../services/order.service");
const createLog = require("../../helpers/activityLog");

// Map trạng thái đơn hàng
const STATUS_MAP = {
    pending: { label: "Chờ xác nhận", class: "status-pending" },
    confirmed: { label: "Đã xác nhận", class: "status-confirmed" },
    shipping: { label: "Đang giao", class: "status-shipping" },
    delivered: { label: "Đã giao", class: "status-delivered" },
    cancelled: { label: "Đã hủy", class: "status-cancelled" }
};

// [GET] /admin/orders
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Filter trạng thái đơn hàng
        const orderStatuses = [
            { name: "Tất cả", status: "", class: "" },
            { name: "Chờ xác nhận", status: "pending", class: "status-pending" },
            { name: "Đã xác nhận", status: "confirmed", class: "status-confirmed" },
            { name: "Đang giao", status: "shipping", class: "status-shipping" },
            { name: "Đã giao", status: "delivered", class: "status-delivered" },
            { name: "Đã hủy", status: "cancelled", class: "status-cancelled" }
        ];

        // Đánh dấu active
        const currentStatus = req.query.status || "";
        orderStatuses.forEach(item => {
            item.active = item.status === currentStatus;
        });

        if (req.query.status) {
            find.status = req.query.status;
        }

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.customerName = objectSearch.regex;
        }

        // Pagination
        const totalItems = await Order.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems);

        // Sort
        const objectSort = sortHelper(req.query);
        let sort = objectSort.sortObject;
        if (!req.query.sortKey) {
            sort = { createdAt: -1 };
        }

        const orders = await Order
            .find(find)
            .sort(sort)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems)
            .lean();

        // Gắn thông tin người đặt (booker) thay vì chỉ người nhận
        const userIds = orders.map(o => o.userId).filter(id => id);
        const users = await User.find({ _id: { $in: userIds } }).select("fullName phone");

        for (const order of orders) {
            // Mặc định là thông tin người nhận (trường hợp khách mua không đăng nhập)
            order.bookerName = order.customerName;
            order.bookerPhone = order.customerPhone;
            
            if (order.userId) {
                const user = users.find(u => u.id === order.userId);
                if (user) {
                    order.bookerName = user.fullName;
                    order.bookerPhone = user.phone;
                }
            }
        }

        res.render("admin/pages/orders/index", {
            pageTitle: "Quản lý đơn hàng",
            currentPage: "orders",
            breadcrumbs: [
                { title: "Đơn hàng" },
                { title: "Danh sách" }
            ],
            orders,
            orderStatuses,
            statusMap: STATUS_MAP,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log("Order index error:", error);
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, deleted: false });

        if (!order) {
            req.flash("error", "Đơn hàng không tồn tại!");
            return res.redirect(`${prefixAdmin}/orders`);
        }

        res.render("admin/pages/orders/detail", {
            pageTitle: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
            currentPage: "orders",
            breadcrumbs: [
                { title: "Đơn hàng", link: `${prefixAdmin}/orders` },
                { title: "Chi tiết" }
            ],
            order,
            statusMap: STATUS_MAP
        });
    } catch (error) {
        console.log("Order detail error:", error);
        res.redirect(`${prefixAdmin}/orders`);
    }
};

// [PATCH] /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.json({ code: 400, message: "Trạng thái không hợp lệ!" });
        }

        const { modified } = await orderService.changeStatus(id, status);

        if (modified) {
            createLog(req, res, {
                action: "change-status",
                module: "orders",
                description: `Đổi trạng thái đơn hàng (ID: ${id}) sang "${STATUS_MAP[status].label}"`
            });
            res.json({ code: 200, message: `Đã cập nhật trạng thái đơn hàng thành "${STATUS_MAP[status].label}"!` });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log("Change order status error:", error);
        res.json({ code: 400, message: "Lỗi cập nhật trạng thái!" });
    }
};

// [DELETE] /admin/orders/delete/:id
module.exports.deleteOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const { modified } = await orderService.softDelete(id);

        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "orders",
                description: `Xóa đơn hàng (ID: ${id})`
            });
            res.json({ code: 200, message: "Đã xóa đơn hàng!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log("Delete order error:", error);
        res.json({ code: 400, message: "Lỗi xóa đơn hàng!" });
    }
};
