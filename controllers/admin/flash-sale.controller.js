const FlashSale = require("../../models/flash-sale.model");
const Product = require("../../models/product.model");
const flashSaleService = require("../../services/flash-sale.service");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/flash-sale
module.exports.index = async (req, res) => {
    try {
        const result = await flashSaleService.list(req.query);
        const flashSales = result.items;
        
        const now = new Date();

        const items = flashSales.map(sale => {
            let timeStatus = "upcoming";
            if (now >= sale.startTime && now <= sale.endTime) {
                timeStatus = "ongoing";
            } else if (now > sale.endTime) {
                timeStatus = "ended";
            }
            return {
                ...sale.toObject(),
                timeStatus
            };
        });

        res.render("admin/pages/flash-sale/index", {
            pageTitle: "Quản lý Flash Sale",
            currentPage: "flash-sale",
            breadcrumbs: [
                { title: "Flash Sale" },
                { title: "Danh sách" }
            ],
            flashSales: items,
            filterStatus: result.filterStatus,
            keyword: result.keyword,
            sortOptions: result.sortOptions,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("FLASH SALE INDEX ERROR:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
}

// [GET] /admin/flash-sale/create
module.exports.create = async (req, res) => {
    try {
        const products = await Product.find({
            deleted: false,
            status: "active"
        }).sort({ position: 1 });

        res.render("admin/pages/flash-sale/create", {
            pageTitle: "Tạo Flash Sale",
            currentPage: "flash-sale",
            breadcrumbs: [
                { title: "Flash Sale", link: `${prefixAdmin}/flash-sale` },
                { title: "Tạo mới" }
            ],
            products
        });
    } catch (error) {
        console.error("FLASH SALE CREATE ERROR:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/flash-sale`);
    }
}

// [POST] /admin/flash-sale/create
module.exports.createPost = async (req, res) => {
    try {
        const flashSale = await flashSaleService.create(req.body);

        createLog(req, res, {
            action: "create",
            module: "flash-sale",
            description: `Tạo Flash Sale: ${flashSale.title}`
        });

        req.flash("success", "Tạo Flash Sale thành công!");
        res.redirect(`${prefixAdmin}/flash-sale`);
    } catch (error) {
        console.error("FLASH SALE CREATE POST ERROR:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
}

// [GET] /admin/flash-sale/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const flashSale = await flashSaleService.findById(req.params.id);

        if (!flashSale) {
            req.flash("error", "Flash Sale không tồn tại!");
            return res.redirect(`${prefixAdmin}/flash-sale`);
        }

        // Get all products for selection
        const products = await Product.find({
            deleted: false,
            status: "active"
        }).sort({ position: 1 });

        // Get selected product details
        const selectedProductIds = flashSale.products.map(p => p.product_id.toString());
        const selectedProducts = await Product.find({
            _id: { $in: selectedProductIds }
        });

        // Merge product details with flash sale data
        const flashSaleProducts = flashSale.products.map(fp => {
            const prod = selectedProducts.find(p => p._id.toString() === fp.product_id.toString());
            return {
                ...fp.toObject(),
                productInfo: prod
            };
        });

        res.render("admin/pages/flash-sale/edit", {
            pageTitle: "Chỉnh sửa Flash Sale",
            currentPage: "flash-sale",
            breadcrumbs: [
                { title: "Flash Sale", link: `${prefixAdmin}/flash-sale` },
                { title: "Chỉnh sửa" }
            ],
            flashSale,
            flashSaleProducts,
            products
        });
    } catch (error) {
        console.error("FLASH SALE EDIT ERROR:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/flash-sale`);
    }
}

// [PATCH] /admin/flash-sale/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const flashSale = await flashSaleService.update(req.params.id, req.body);

        createLog(req, res, {
            action: "edit",
            module: "flash-sale",
            description: `Chỉnh sửa Flash Sale: ${flashSale.title}`
        });

        req.flash("success", "Cập nhật Flash Sale thành công!");
        res.redirect(`${prefixAdmin}/flash-sale`);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            req.flash("error", "Flash Sale không tồn tại!");
        } else {
            console.error("FLASH SALE EDIT PATCH ERROR:", error);
            req.flash("error", "Có lỗi xảy ra!");
        }
        res.redirect("back");
    }
}

// [PATCH] /admin/flash-sale/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        await flashSaleService.changeStatus(req.params.id, req.params.status);

        createLog(req, res, {
            action: "edit",
            module: "flash-sale",
            description: `Đổi trạng thái Flash Sale (ID: ${req.params.id}) sang ${req.params.status}`
        });

        res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
}

// [DELETE] /admin/flash-sale/delete/:id
module.exports.deleteFlashSale = async (req, res) => {
    try {
        await flashSaleService.softDelete(req.params.id);

        createLog(req, res, {
            action: "delete",
            module: "flash-sale",
            description: `Xóa Flash Sale (ID: ${req.params.id})`
        });

        res.json({ code: 200, message: "Xóa Flash Sale thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
}
