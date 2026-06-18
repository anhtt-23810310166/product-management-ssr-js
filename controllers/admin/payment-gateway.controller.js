const PaymentGateway = require("../../models/payment-gateway.model");
const searchHelper = require("../../helpers/search");
const filterStatusHelper = require("../../helpers/filterStatus");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/payment-gateways
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.name = objectSearch.regex;
        }

        // Filter Status
        const filterStatus = filterStatusHelper(req.query);
        if (req.query.status) {
            find.status = req.query.status;
        }

        // Sort
        const sortOptions = [
            { value: "createdAt-desc", label: "Mới nhất" },
            { value: "createdAt-asc", label: "Cũ nhất" },
            { value: "name-asc", label: "Tên A - Z" },
            { value: "name-desc", label: "Tên Z - A" }
        ];
        const objectSort = sortHelper(req.query, sortOptions);
        const sort = Object.keys(objectSort.sortObject).length > 0 ? objectSort.sortObject : { createdAt: -1 };

        // Pagination
        const totalItems = await PaymentGateway.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        let records = await PaymentGateway.find(find)
            .sort(sort)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        // Tự động seed nếu chưa có (chỉ để demo)
        if (records.length === 0 && !req.query.keyword && !req.query.status) {
            await PaymentGateway.insertMany([
                { name: "VNPay", code: "vnpay", appId: "CGXZLS0Z", secretKey1: "XNBXY... (Demo)", endpoint: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html" },
                { name: "ZaloPay", code: "zalopay", appId: "2553", secretKey1: "PcY4iZIKFCIdgZiC6xTXpeZl5B11g...", endpoint: "https://sb-openapi.zalopay.vn/v2/create" }
            ]);
            records = await PaymentGateway.find(find).sort(sort).skip(objectPagination.skip).limit(objectPagination.limitItems);
        }

        res.render("admin/pages/payment-gateways/index", {
            pageTitle: "Cổng thanh toán",
            currentPage: "payment-gateways",
            breadcrumbs: [
                { title: "Cài đặt", link: `${res.locals.prefixAdmin}/settings` },
                { title: "Cổng thanh toán" }
            ],
            records: records,
            keyword: objectSearch.keyword,
            filterStatus: filterStatus,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/payment-gateways/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        await PaymentGateway.updateOne({ _id: id }, { status: status });
        req.flash("success", "Cập nhật trạng thái cổng thanh toán thành công!");
        res.redirect("back");
    } catch (error) {
        res.redirect("back");
    }
};

// [GET] /admin/payment-gateways/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/payment-gateways/create", {
        pageTitle: "Thêm mới cổng thanh toán",
    });
};

// [POST] /admin/payment-gateways/create
module.exports.createPost = async (req, res) => {
    try {
        if (!req.body.name || !req.body.code) {
            req.flash("error", "Vui lòng nhập đầy đủ Tên và Mã cổng thanh toán!");
            return res.redirect("back");
        }
        const record = new PaymentGateway(req.body);
        await record.save();
        req.flash("success", "Thêm cổng thanh toán thành công!");
        res.redirect("back");
    } catch (error) {
        res.redirect("back");
    }
};

// [DELETE] /admin/payment-gateways/delete/:id
module.exports.deleteRecord = async (req, res) => {
    try {
        await PaymentGateway.updateOne({ _id: req.params.id }, { deleted: true, deletedAt: new Date() });
        res.json({ code: 200, message: "Đã xóa cổng thanh toán!" });
    } catch (error) {
        res.json({ code: 400, message: "Lỗi xóa dữ liệu!" });
    }
};

// [GET] /admin/payment-gateways/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const record = await PaymentGateway.findOne({ _id: req.params.id, deleted: false });
        if (!record) {
            req.flash("error", "Không tìm thấy dữ liệu!");
            return res.redirect(`${res.locals.prefixAdmin}/settings/payment-gateways`);
        }
        res.render("admin/pages/payment-gateways/edit", {
            pageTitle: "Chỉnh sửa cổng thanh toán",
            record: record
        });
    } catch (error) {
        res.redirect("back");
    }
};

// [PATCH] /admin/payment-gateways/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        await PaymentGateway.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect(`${res.locals.prefixAdmin}/settings/payment-gateways`);
    } catch (error) {
        res.redirect("back");
    }
};

// [PATCH] /admin/payment-gateways/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        let count = 0;

        switch (type) {
            case "active":
            case "inactive":
                const updateStatus = await PaymentGateway.updateMany({ _id: { $in: ids } }, { status: type });
                count = updateStatus.modifiedCount;
                break;
            case "delete":
                const updateDelete = await PaymentGateway.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
                count = updateDelete.modifiedCount;
                break;
            default:
                return res.json({ code: 400, message: "Hành động không hợp lệ!" });
        }

        res.json({
            code: 200,
            message: count > 0 ? "Cập nhật thành công!" : "Không có thay đổi nào!",
            count: count
        });
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
};
