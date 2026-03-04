const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Brand = require("../../models/brand.model");
const productService = require("../../services/product.service");
const createTree = require("../../helpers/createTree");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    const result = await productService.list(req.query);

    // Category lookup
    const categories = await ProductCategory.find({ deleted: false });
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat._id.toString()] = cat.title;
    });

    // Brand lookup
    const brands = await Brand.find({ deleted: false, status: "active" }).sort({ position: 1 });
    const brandMap = {};
    brands.forEach(b => {
        brandMap[b._id.toString()] = b.name;
    });

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        currentPage: "products",
        breadcrumbs: [
            { title: "Sản phẩm" },
            { title: "Danh sách" }
        ],
        products: result.items,
        filterStatus: result.filterStatus,
        keyword: result.keyword,
        sortOptions: result.sortOptions,
        pagination: result.pagination,
        categoryMap: categoryMap,
        brandMap: brandMap
    });
}

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    const categories = await ProductCategory.find({ deleted: false }).sort({ position: "asc" });
    const tree = createTree(categories);
    const brands = await Brand.find({ deleted: false, status: "active" }).sort({ position: 1 });

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm sản phẩm mới",
        currentPage: "product-create",
        breadcrumbs: [
            { title: "Sản phẩm" },
            { title: "Thêm sản phẩm" }
        ],
        categories: tree,
        brands: brands
    });
}

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
    try {
        const product = await productService.create(req.body, req.files);

        createLog(req, res, {
            action: "create",
            module: "products",
            description: `Thêm sản phẩm: ${product.title}`
        });

        req.flash("success", "Thêm sản phẩm thành công!");
        res.redirect(`${prefixAdmin}/products`);
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
}

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const product = await productService.findById(req.params.id);
        if (!product) {
            req.flash("error", "Sản phẩm không tồn tại!");
            return res.redirect(`${prefixAdmin}/products`);
        }

        const categories = await ProductCategory.find({ deleted: false }).sort({ position: "asc" });
        const tree = createTree(categories);
        const brands = await Brand.find({ deleted: false, status: "active" }).sort({ position: 1 });

        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            currentPage: "products",
            breadcrumbs: [
                { title: "Sản phẩm", link: `${prefixAdmin}/products` },
                { title: "Chỉnh sửa" }
            ],
            product: product,
            categories: tree,
            brands: brands,
            returnUrl: req.headers.referer || `${prefixAdmin}/products`
        });
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/products`);
    }
}

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const product = await productService.update(req.params.id, req.body, req.files);

        createLog(req, res, {
            action: "edit",
            module: "products",
            description: `Chỉnh sửa sản phẩm: ${product.title}`
        });

        req.flash("success", "Cập nhật sản phẩm thành công!");
        res.redirect(req.body.returnUrl || `${prefixAdmin}/products`);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            req.flash("error", "Sản phẩm không tồn tại!");
            return res.redirect(`${prefixAdmin}/products`);
        }
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
}

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const product = await productService.findById(req.params.id);
        if (!product) {
            req.flash("error", "Sản phẩm không tồn tại!");
            return res.redirect(`${prefixAdmin}/products`);
        }

        // Get category
        let category = null;
        if (product.product_category_id) {
            category = await ProductCategory.findById(product.product_category_id);
        }

        // Get brand
        let brand = null;
        if (product.brand_id) {
            brand = await Brand.findById(product.brand_id);
        }

        res.render("admin/pages/products/detail", {
            pageTitle: "Chi tiết sản phẩm",
            currentPage: "products",
            breadcrumbs: [
                { title: "Sản phẩm", link: `${prefixAdmin}/products` },
                { title: "Chi tiết" }
            ],
            product: product,
            category: category,
            brand: brand
        });
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/products`);
    }
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        const { modified } = await productService.changeStatus(id, status);

        if (modified) {
            createLog(req, res, {
                action: "change-status",
                module: "products",
                description: `Đổi trạng thái sản phẩm sang ${status === "active" ? "hoạt động" : "dừng hoạt động"}`
            });
            res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
}

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        const { count } = await productService.changeMulti(ids, type);

        if (count > 0) {
            createLog(req, res, {
                action: "change-multi",
                module: "products",
                description: `Thao tác hàng loạt [${type}] trên ${count} sản phẩm`
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
}

// [DELETE] /admin/products/delete/:id
module.exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { modified } = await productService.softDelete(id);

        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "products",
                description: `Xoá sản phẩm (ID: ${id})`
            });
            res.json({ code: 200, message: "Xoá sản phẩm thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
}
