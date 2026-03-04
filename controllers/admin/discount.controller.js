const Discount = require("../../models/discount.model");
const discountService = require("../../services/discount.service");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/discounts
module.exports.index = async (req, res) => {
    try {
        const discounts = await Discount.find({ deleted: false }).sort({ createdAt: -1 });
        res.render("admin/pages/discounts/index", {
            pageTitle: "Mã giảm giá",
            discounts
        });
    } catch (error) {
        console.error("DISCOUNT INDEX ERROR:", error);
        req.flash("error", "Đã xảy ra lỗi!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/discounts/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/discounts/create", {
        pageTitle: "Thêm mã giảm giá"
    });
};

// [POST] /admin/discounts/create
module.exports.createPost = async (req, res) => {
    try {
        const discount = await discountService.create(req.body);

        createLog(req, res, {
            action: "create",
            module: "discounts",
            description: `Tạo mã giảm giá: ${discount.code}`
        });

        req.flash("success", "Tạo mã giảm giá thành công!");
        res.redirect(`${prefixAdmin}/discounts`);
    } catch (error) {
        if (error.message === "DUPLICATE_CODE") {
            req.flash("error", "Mã giảm giá đã tồn tại!");
        } else {
            console.error("DISCOUNT CREATE ERROR:", error);
            req.flash("error", "Có lỗi xảy ra!");
        }
        res.redirect("back");
    }
};

// [GET] /admin/discounts/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const discount = await discountService.findById(req.params.id);
        if (!discount) {
            req.flash("error", "Mã giảm giá không tồn tại!");
            return res.redirect(`${prefixAdmin}/discounts`);
        }
        res.render("admin/pages/discounts/edit", {
            pageTitle: "Sửa mã giảm giá",
            discount
        });
    } catch (error) {
        console.error("DISCOUNT EDIT ERROR:", error);
        req.flash("error", "Đã xảy ra lỗi!");
        res.redirect(`${prefixAdmin}/discounts`);
    }
};

// [PATCH] /admin/discounts/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        await discountService.update(req.params.id, req.body);

        createLog(req, res, {
            action: "edit",
            module: "discounts",
            description: `Cập nhật mã giảm giá: ${(req.body.code || "").toUpperCase()}`
        });

        req.flash("success", "Cập nhật thành công!");
        res.redirect(`${prefixAdmin}/discounts`);
    } catch (error) {
        if (error.message === "DUPLICATE_CODE") {
            req.flash("error", "Mã giảm giá đã tồn tại!");
        } else {
            console.error("DISCOUNT EDIT PATCH ERROR:", error);
            req.flash("error", "Có lỗi xảy ra!");
        }
        res.redirect("back");
    }
};

// [PATCH] /admin/discounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        await discountService.changeStatus(req.params.id, req.params.status);

        createLog(req, res, {
            action: "edit",
            module: "discounts",
            description: `Đổi trạng thái mã giảm giá (ID: ${req.params.id}) → ${req.params.status}`
        });

        req.flash("success", "Cập nhật trạng thái thành công!");
        res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
};

// [DELETE] /admin/discounts/delete/:id
module.exports.deleteDiscount = async (req, res) => {
    try {
        await discountService.softDelete(req.params.id);

        createLog(req, res, {
            action: "delete",
            module: "discounts",
            description: `Xóa mã giảm giá (ID: ${req.params.id})`
        });

        res.json({ code: 200, message: "Xóa mã giảm giá thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
};
