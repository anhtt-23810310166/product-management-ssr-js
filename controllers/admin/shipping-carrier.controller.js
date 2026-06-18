const ShippingCarrier = require("../../models/shipping-carrier.model");
const searchHelper = require("../../helpers/search");
const filterStatusHelper = require("../../helpers/filterStatus");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/shipping-carriers
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
            { value: "name-desc", label: "Tên Z - A" },
            { value: "baseFee-desc", label: "Phí giảm dần" },
            { value: "baseFee-asc", label: "Phí tăng dần" }
        ];
        const objectSort = sortHelper(req.query, sortOptions);
        const sort = Object.keys(objectSort.sortObject).length > 0 ? objectSort.sortObject : { createdAt: -1 };

        // Pagination
        const totalItems = await ShippingCarrier.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        const records = await ShippingCarrier.find(find)
            .sort(sort)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        res.render("admin/pages/shipping-carriers/index", {
            pageTitle: "Hãng vận chuyển",
            currentPage: "shipping-carriers",
            breadcrumbs: [
                { title: "Cài đặt", link: `${res.locals.prefixAdmin}/settings` },
                { title: "Hãng vận chuyển" }
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

// [PATCH] /admin/shipping-carriers/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        await ShippingCarrier.updateOne({ _id: id }, { status: status });
        req.flash("success", "Cập nhật trạng thái thành công!");
        res.redirect("back");
    } catch (error) {
        res.redirect("back");
    }
};

// [GET] /admin/shipping-carriers/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/shipping-carriers/create", {
        pageTitle: "Thêm mới hãng vận chuyển",
    });
};

// [POST] /admin/shipping-carriers/create
module.exports.createPost = async (req, res) => {
    try {
        if (!req.body.name) {
            req.flash("error", "Tên hãng không được để trống!");
            return res.redirect("back");
        }
        req.body.baseFee = parseInt(req.body.baseFee) || 0;
        const record = new ShippingCarrier(req.body);
        await record.save();
        req.flash("success", "Thêm hãng vận chuyển thành công!");
        res.redirect("back");
    } catch (error) {
        res.redirect("back");
    }
};

// [DELETE] /admin/shipping-carriers/delete/:id
module.exports.deleteRecord = async (req, res) => {
    try {
        await ShippingCarrier.updateOne({ _id: req.params.id }, { deleted: true, deletedAt: new Date() });
        res.json({ code: 200, message: "Đã xóa hãng vận chuyển!" });
    } catch (error) {
        res.json({ code: 400, message: "Lỗi xóa dữ liệu!" });
    }
};

// [GET] /admin/shipping-carriers/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const record = await ShippingCarrier.findOne({ _id: req.params.id, deleted: false });
        if (!record) {
            req.flash("error", "Không tìm thấy dữ liệu!");
            return res.redirect(`${res.locals.prefixAdmin}/settings/shipping-carriers`);
        }
        res.render("admin/pages/shipping-carriers/edit", {
            pageTitle: "Chỉnh sửa hãng vận chuyển",
            record: record
        });
    } catch (error) {
        res.redirect("back");
    }
};

// [PATCH] /admin/shipping-carriers/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        req.body.baseFee = parseInt(req.body.baseFee) || 0;
        await ShippingCarrier.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect(`${res.locals.prefixAdmin}/settings/shipping-carriers`);
    } catch (error) {
        res.redirect("back");
    }
};

// [PATCH] /admin/shipping-carriers/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        let count = 0;

        switch (type) {
            case "active":
            case "inactive":
                const updateStatus = await ShippingCarrier.updateMany({ _id: { $in: ids } }, { status: type });
                count = updateStatus.modifiedCount;
                break;
            case "delete":
                const updateDelete = await ShippingCarrier.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
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
