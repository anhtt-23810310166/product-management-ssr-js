const roleService = require("../../services/role.service");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    try {
        const result = await roleService.list(req.query);

        res.render("admin/pages/roles/index", {
            pageTitle: "Danh sách nhóm quyền",
            currentPage: "roles",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Nhóm quyền" }
            ],
            roles: result.items,
            keyword: result.keyword,
            sortOptions: result.sortOptions,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("ROLE INDEX ERROR", error);
        res.redirect("back");
    }
};

// [GET] /admin/roles/create
module.exports.create = (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Thêm nhóm quyền",
        currentPage: "roles",
        breadcrumbs: [
            { title: "Cài đặt", link: `${prefixAdmin}/settings` },
            { title: "Nhóm quyền", link: `${prefixAdmin}/roles` },
            { title: "Thêm nhóm quyền" }
        ],
    });
};

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    try {
        const role = await roleService.create(req.body);

        createLog(req, res, {
            action: "create",
            module: "roles",
            description: `Thêm nhóm quyền: ${role.title}`
        });

        req.flash("success", "Thêm nhóm quyền thành công!");
        res.redirect(`${prefixAdmin}/roles`);
    } catch (error) {
        console.error("ROLE CREATE ERROR", error);
        req.flash("error", "Thêm nhóm quyền thất bại!");
        res.redirect("back");
    }
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const role = await roleService.findById(req.params.id);
        if (!role) {
            req.flash("error", "Nhóm quyền không tồn tại!");
            return res.redirect(`${prefixAdmin}/roles`);
        }
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            currentPage: "roles",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Nhóm quyền", link: `${prefixAdmin}/roles` },
                { title: role.title }
            ],
            role: role,
        });
    } catch (error) {
        console.error("ROLE EDIT ERROR", error);
        res.redirect("back");
    }
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const role = await roleService.update(req.params.id, req.body);

        createLog(req, res, {
            action: "edit",
            module: "roles",
            description: `Chỉnh sửa nhóm quyền: ${role.title}`
        });

        req.flash("success", "Cập nhật nhóm quyền thành công!");
        res.redirect(req.body.returnUrl || `${prefixAdmin}/roles`);
    } catch (error) {
        console.error("ROLE UPDATE ERROR", error);
        if (error.message === "NOT_FOUND") {
            req.flash("error", "Nhóm quyền không tồn tại!");
            return res.redirect(`${prefixAdmin}/roles`);
        }
        req.flash("error", "Cập nhật nhóm quyền thất bại!");
        res.redirect("back");
    }
};

// [DELETE] /admin/roles/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const { modified } = await roleService.softDelete(req.params.id);

        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "roles",
                description: `Xoá nhóm quyền (ID: ${req.params.id})`
            });

            res.json({ code: 200, message: "Xóa nhóm quyền thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.error("ROLE DELETE ERROR", error);
        res.json({ code: 400, message: "Xóa nhóm quyền thất bại!" });
    }
};

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const role = await roleService.findById(req.params.id);
        if (!role) {
            req.flash("error", "Nhóm quyền không tồn tại!");
            return res.redirect(`${prefixAdmin}/roles`);
        }
        res.render("admin/pages/roles/detail", {
            pageTitle: "Chi tiết nhóm quyền",
            currentPage: "roles",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Nhóm quyền", link: `${prefixAdmin}/roles` },
                { title: role.title }
            ],
            role: role,
        });
    } catch (error) {
        console.error("ROLE DETAIL ERROR", error);
        res.redirect("back");
    }
};

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    try {
        const roles = await roleService.getAll();

        res.render("admin/pages/roles/permissions", {
            pageTitle: "Phân quyền",
            currentPage: "settings",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Phân quyền" }
            ],
            roles: roles
        });
    } catch (error) {
        console.error("ROLE PERM GET ERROR", error);
        res.redirect("back");
    }
};

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    try {
        const permissions = JSON.parse(req.body.permissions);
        await roleService.updatePermissions(permissions);

        req.flash("success", "Cập nhật phân quyền thành công!");
        createLog(req, res, {
            action: "permissions",
            module: "roles",
            description: `Cập nhật phân quyền cho ${permissions.length} nhóm`
        });
    } catch (error) {
        console.error("ROLE PERM PATCH ERROR", error);
        req.flash("error", "Cập nhật phân quyền thất bại!");
    }

    res.redirect("back");
};
