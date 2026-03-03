const FlashSale = require("../../models/flash-sale.model");
const Product = require("../../models/product.model");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/flash-sale
module.exports.index = async (req, res) => {
    try {
        const flashSales = await FlashSale.find({ deleted: false })
            .sort({ createdAt: -1 });

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
            flashSales: items
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
        const { title, startTime, endTime } = req.body;

        // Parse products from form
        const products = [];
        if (req.body.productIds) {
            const ids = Array.isArray(req.body.productIds) ? req.body.productIds : [req.body.productIds];
            const discounts = Array.isArray(req.body.productDiscounts) ? req.body.productDiscounts : [req.body.productDiscounts];
            const stocks = Array.isArray(req.body.productStocks) ? req.body.productStocks : [req.body.productStocks];

            for (let i = 0; i < ids.length; i++) {
                products.push({
                    product_id: ids[i],
                    discountPercentage: parseInt(discounts[i]) || 0,
                    stock: parseInt(stocks[i]) || 0,
                    sold: 0
                });
            }
        }

        const flashSale = new FlashSale({
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            products,
            status: req.body.status || "active"
        });
        await flashSale.save();

        createLog(req, res, {
            action: "create",
            module: "flash-sale",
            description: `Tạo Flash Sale: ${title}`
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
        const flashSale = await FlashSale.findOne({
            _id: req.params.id,
            deleted: false
        });

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
        const flashSale = await FlashSale.findOne({
            _id: req.params.id,
            deleted: false
        });

        if (!flashSale) {
            req.flash("error", "Flash Sale không tồn tại!");
            return res.redirect(`${prefixAdmin}/flash-sale`);
        }

        flashSale.title = req.body.title;
        flashSale.startTime = new Date(req.body.startTime);
        flashSale.endTime = new Date(req.body.endTime);
        flashSale.status = req.body.status || "active";

        // Re-parse products
        const products = [];
        if (req.body.productIds) {
            const ids = Array.isArray(req.body.productIds) ? req.body.productIds : [req.body.productIds];
            const discounts = Array.isArray(req.body.productDiscounts) ? req.body.productDiscounts : [req.body.productDiscounts];
            const stocks = Array.isArray(req.body.productStocks) ? req.body.productStocks : [req.body.productStocks];

            for (let i = 0; i < ids.length; i++) {
                // Keep existing sold count if product was already in the sale
                const existing = flashSale.products.find(p => p.product_id.toString() === ids[i]);
                products.push({
                    product_id: ids[i],
                    discountPercentage: parseInt(discounts[i]) || 0,
                    stock: parseInt(stocks[i]) || 0,
                    sold: existing ? existing.sold : 0
                });
            }
        }
        flashSale.products = products;

        await flashSale.save();

        createLog(req, res, {
            action: "edit",
            module: "flash-sale",
            description: `Chỉnh sửa Flash Sale: ${flashSale.title}`
        });

        req.flash("success", "Cập nhật Flash Sale thành công!");
        res.redirect(`${prefixAdmin}/flash-sale`);
    } catch (error) {
        console.error("FLASH SALE EDIT PATCH ERROR:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
}

// [PATCH] /admin/flash-sale/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        await FlashSale.updateOne({ _id: id }, { status });

        createLog(req, res, {
            action: "change-status",
            module: "flash-sale",
            description: `Đổi trạng thái Flash Sale sang ${status === "active" ? "hoạt động" : "dừng hoạt động"}`
        });

        res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
}

// [DELETE] /admin/flash-sale/delete/:id
module.exports.deleteFlashSale = async (req, res) => {
    try {
        await FlashSale.updateOne(
            { _id: req.params.id },
            { deleted: true, deletedAt: new Date() }
        );

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
