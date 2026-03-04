const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const accountService = require("../../services/account.service");
const bcrypt = require("bcryptjs");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    try {
        const sortOptions = [
            { value: "fullName-asc", label: "Tên A - Z" },
            { value: "fullName-desc", label: "Tên Z - A" },
            { value: "createdAt-desc", label: "Mới nhất" },
            { value: "createdAt-asc", label: "Cũ nhất" }
        ];

        const result = await accountService.list(req.query, { sortOptions, limit: 20 });

        // Get role names
        const roles = await Role.find({ deleted: false });
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role._id] = role.title;
        });

        res.render("admin/pages/accounts/index", {
            pageTitle: "Danh sách tài khoản",
            currentPage: "accounts",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Danh sách tài khoản" }
            ],
            accounts: result.items,
            roleMap: roleMap,
            keyword: result.keyword,
            filterStatus: result.filterStatus,
            sortOptions: result.sortOptions,
            pagination: result.pagination
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    try {
        const roles = await Role.find({ deleted: false });

        res.render("admin/pages/accounts/create", {
            pageTitle: "Thêm tài khoản",
            currentPage: "accounts",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Tài khoản", link: `${prefixAdmin}/accounts` },
                { title: "Thêm tài khoản" }
            ],
            roles: roles
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    try {
        // Check email unique
        const existEmail = await Account.findOne({
            email: req.body.email,
            deleted: false
        });
        if (existEmail) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }

        const account = await accountService.create(req.body, req.file);

        createLog(req, res, {
            action: "create",
            module: "accounts",
            description: `Thêm tài khoản quản trị: ${account.fullName}`
        });

        req.flash("success", "Tạo mới tài khoản thành công!");
        res.redirect(`${prefixAdmin}/accounts`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            deleted: false
        }).select("-password -token");

        if (!account) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }

        const roles = await Role.find({ deleted: false });

        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            currentPage: "accounts",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Tài khoản", link: `${prefixAdmin}/accounts` },
                { title: account.fullName }
            ],
            account: account,
            roles: roles,
            returnUrl: req.headers.referer || `${prefixAdmin}/accounts`
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        // Check email unique (excluding current)
        const existEmail = await Account.findOne({
            email: req.body.email,
            _id: { $ne: req.params.id },
            deleted: false
        });
        if (existEmail) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }

        // Only update password if provided
        const account = await accountService.update(req.params.id, req.body, req.file);

        createLog(req, res, {
            action: "edit",
            module: "accounts",
            description: `Chỉnh sửa tài khoản quản trị: ${account.fullName}`
        });

        req.flash("success", "Cập nhật tài khoản thành công!");
        const returnUrl = req.body.returnUrl;
        delete req.body.returnUrl;
        res.redirect(returnUrl || `${prefixAdmin}/accounts`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            deleted: false
        }).select("-password -token");

        if (!account) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }

        // Get role name
        let role = null;
        if (account.role_id) {
            role = await Role.findOne({ _id: account.role_id });
        }

        res.render("admin/pages/accounts/detail", {
            pageTitle: "Chi tiết tài khoản",
            currentPage: "accounts",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Tài khoản", link: `${prefixAdmin}/accounts` },
                { title: account.fullName }
            ],
            account: account,
            role: role
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        const validStatuses = ["active", "inactive"];

        if (!validStatuses.includes(status)) {
            return res.json({ code: 400, message: "Trạng thái không hợp lệ!" });
        }

        const { modified } = await accountService.changeStatus(id, status);
        const statusLabels = { active: "Hoạt động", inactive: "Dừng hoạt động" };

        if (modified) {
            createLog(req, res, {
                action: "change-status",
                module: "accounts",
                description: `Đổi trạng thái tài khoản quản trị (ID: ${id}) sang "${statusLabels[status]}"`
            });
            res.json({
                code: 200,
                message: `Đã cập nhật trạng thái thành "${statusLabels[status]}"!`,
                status: status
            });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log("Change account status error:", error);
        res.json({ code: 500, message: "Lỗi cập nhật trạng thái!" });
    }
};

// [PATCH] /admin/accounts/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        const { count } = await accountService.changeMulti(ids, type);

        if (count > 0) {
            createLog(req, res, {
                action: "change-multi",
                module: "accounts",
                description: `Thao tác hàng loạt [${type}] trên ${count} tài khoản`
            });
        }

        res.json({
            code: 200,
            message: count > 0 ? "Cập nhật thành công!" : "Không có thay đổi nào!",
            count: count
        });
    } catch (error) {
        if (error.message === "INVALID_ACTION") {
            return res.json({ code: 400, message: "Hành động không hợp lệ!" });
        }
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
};

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteAccount = async (req, res) => {
    try {
        const { modified } = await accountService.softDelete(req.params.id);

        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "accounts",
                description: `Xóa tài khoản quản trị (ID: ${req.params.id})`
            });
            res.json({ code: 200, message: "Đã xóa tài khoản quản trị!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log("Delete account error:", error);
        res.json({ code: 400, message: "Lỗi xóa tài khoản quản trị!" });
    }
};
