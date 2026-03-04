const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Brand = require("../../models/brand.model");
const Review = require("../../models/review.model");
const Order = require("../../models/order.model");
const FlashSale = require("../../models/flash-sale.model");

// Helper: lấy tất cả ID con cháu của 1 category
const getDescendantIds = async (parentId) => {
    const children = await ProductCategory.find({
        parent_id: parentId,
        status: "active",
        deleted: false
    });
    let ids = children.map(c => c.id);
    for (const child of children) {
        const subIds = await getDescendantIds(child.id);
        ids = ids.concat(subIds);
    }
    return ids;
};

// [GET] /products
module.exports.index = async (req, res) => {
    try {
        const find = {
            status: "active",
            deleted: false,
            stock: { $gt: 0 }
        };

        let currentCategory = null;
        const keyword = req.query.keyword || "";

        let selectedBrands = [];
        if (req.query.brand) {
            if (Array.isArray(req.query.brand)) {
                selectedBrands = req.query.brand;
            } else {
                selectedBrands = [req.query.brand];
            }
        }

        // Lọc theo danh mục
        if (req.query.category) {
            const category = await ProductCategory.findOne({
                slug: req.query.category,
                status: "active",
                deleted: false
            });

            if (category) {
                currentCategory = category;
                const descendantIds = await getDescendantIds(category.id);
                const allCategoryIds = [category.id, ...descendantIds];
                find.product_category_id = { $in: allCategoryIds };
            }
        }

        // Lọc theo thương hiệu
        if (selectedBrands.length > 0) {
            const brandsFound = await Brand.find({
                slug: { $in: selectedBrands },
                status: "active",
                deleted: false
            });
            if (brandsFound.length > 0) {
                find.brand_id = { $in: brandsFound.map(b => b.id) };
            }
        }

        // Tìm kiếm theo từ khóa (kế thừa pattern từ admin search)
        if (keyword.trim()) {
            const keywordRegex = new RegExp(keyword.trim(), "i");
            find.title = keywordRegex;
        }

        // Lọc theo khoảng giá
        const priceMin = req.query.priceMin ? parseInt(req.query.priceMin) : null;
        const priceMax = req.query.priceMax ? parseInt(req.query.priceMax) : null;
        if (priceMin || priceMax) {
            find.price = {};
            if (priceMin) find.price.$gte = priceMin;
            if (priceMax) find.price.$lte = priceMax;
        }

        // Sắp xếp
        const sortBy = req.query.sortBy || "position";
        let sortOption = { position: "desc" };
        switch (sortBy) {
            case "price-asc": sortOption = { price: 1 }; break;
            case "price-desc": sortOption = { price: -1 }; break;
            case "newest": sortOption = { createdAt: -1 }; break;
            case "oldest": sortOption = { createdAt: 1 }; break;
            default: sortOption = { position: "desc" };
        }

        // Lấy tất cả thương hiệu cho sidebar
        const allBrands = await Brand.find({
            status: "active",
            deleted: false
        }).sort({ position: "asc" });

        const products = await Product.find(find)
            .sort(sortOption);

        res.render("client/pages/products/index", {
            title: keyword ? `Tìm kiếm: ${keyword}` : (currentCategory ? currentCategory.title : "Sản phẩm"),
            products,
            currentCategory,
            keyword,
            brands: allBrands,
            selectedBrands,
            priceMin: priceMin || "",
            priceMax: priceMax || "",
            sortBy
        });
    } catch (error) {
        console.log(error);
        res.render("client/pages/products/index", {
            title: "Sản phẩm",
            products: [],
            currentCategory: null,
            keyword: "",
            brands: [],
            selectedBrands: []
        });
    }
}

// [GET] /products/compare?ids=id1,id2,id3
module.exports.compare = async (req, res) => {
    try {
        const ids = req.query.ids ? req.query.ids.split(",").filter(Boolean) : [];

        let products = [];
        if (ids.length > 0) {
            products = await Product.find({
                _id: { $in: ids },
                status: "active",
                deleted: false
            }).lean();

            // Attach brand name
            const brandIds = products.map(p => p.brand_id).filter(Boolean);
            const brands = await Brand.find({ _id: { $in: brandIds } }).lean();
            const brandMap = {};
            brands.forEach(b => { brandMap[b._id.toString()] = b.name; });

            products = products.map(p => {
                p.brandName = brandMap[p.brand_id] || "—";
                p.priceNew = p.discountPercentage
                    ? Math.round(p.price * (1 - p.discountPercentage / 100))
                    : p.price;
                return p;
            });
        }

        res.render("client/pages/products/compare", {
            pageTitle: "So sánh sản phẩm",
            products: products
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// Trigger Nodemon Reload v2

// [GET] /products/detail/:slug
module.exports.detail = async (req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            status: "active",
            deleted: false
        });

        if (!product) {
            return res.redirect("/products");
        }

        // If product has a category, check if that category is active
        if (product.product_category_id) {
            const category = await ProductCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false
            });

            if (!category) {
                return res.redirect("/products"); // Category is inactive -> hide product
            }
        }

        // Get brand info
        let brand = null;
        if (product.brand_id) {
            brand = await Brand.findOne({
                _id: product.brand_id,
                deleted: false
            });
        }

        // Kiểm tra Flash Sale đang diễn ra cho sản phẩm này
        let flashDiscount = null;
        const now = new Date();
        const activeFlashSale = await FlashSale.findOne({
            status: "active",
            deleted: false,
            startTime: { $lte: now },
            endTime: { $gte: now },
            "products.product_id": product._id
        });

        if (activeFlashSale) {
            const flashProduct = activeFlashSale.products.find(
                p => p.product_id.toString() === product._id.toString()
            );
            if (flashProduct && flashProduct.sold < flashProduct.stock) {
                flashDiscount = {
                    percentage: flashProduct.discountPercentage,
                    saleTitle: activeFlashSale.title,
                    endTime: activeFlashSale.endTime,
                    stock: flashProduct.stock,
                    sold: flashProduct.sold || 0
                };
            }
        }

        // Lấy danh sách đánh giá
        const reviews = await Review.find({
            productId: product._id.toString(),
            deleted: false
        }).sort({ createdAt: -1 });

        // Tính trung bình sao
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
        }

        // Kiểm tra user đã mua chưa & đã review chưa
        let canReview = false;
        let hasReviewed = false;
        const user = res.locals.clientUser;

        if (user) {
            const hasPurchased = await Order.findOne({
                userId: user._id.toString(),
                "items.productId": product._id.toString(),
                status: "delivered",
                deleted: false
            });

            if (hasPurchased) {
                canReview = true;
                const existingReview = await Review.findOne({
                    productId: product._id.toString(),
                    userId: user._id.toString(),
                    deleted: false
                });
                if (existingReview) {
                    canReview = false;
                    hasReviewed = true;
                }
            }
        }

        // Tính tổng số lượng đã bán
        const allOrders = await Order.find({
            "items.productId": product._id.toString(),
            status: { $ne: "cancelled" },
            deleted: false
        });
        
        let soldCount = 0;
        for (const order of allOrders) {
            const item = order.items.find(i => i.productId === product._id.toString());
            if (item) {
                soldCount += item.quantity;
            }
        }
        // Gợi ý sản phẩm liên quan (cùng danh mục hoặc thương hiệu)
        const relatedQuery = {
            _id: { $ne: product._id },
            status: "active",
            deleted: false,
            stock: { $gt: 0 }
        };

        // Ưu tiên cùng danh mục, nếu có brand thì OR thêm
        const orConditions = [];
        if (product.product_category_id) {
            orConditions.push({ product_category_id: product.product_category_id });
        }
        if (product.brand_id) {
            orConditions.push({ brand_id: product.brand_id });
        }
        if (orConditions.length > 0) {
            relatedQuery.$or = orConditions;
        }

        const relatedProducts = await Product.find(relatedQuery)
            .sort({ position: -1 })
            .limit(4)
            .lean();

        res.render("client/pages/products/detail", {
            title: product.title,
            product: product,
            brand: brand,
            reviews: reviews,
            averageRating: averageRating,
            reviewCount: reviews.length,
            canReview: canReview,
            hasReviewed: hasReviewed,
            soldCount: soldCount,
            flashDiscount: flashDiscount,
            relatedProducts: relatedProducts
        });
    } catch (error) {
        res.redirect("/products");
    }
}

// [GET] /products/suggest?keyword=...
module.exports.suggest = async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim();
        if (!keyword || keyword.length < 1) {
            return res.json([]);
        }

        const regex = new RegExp(keyword, "i");
        const products = await Product.find({
            title: regex,
            status: "active",
            deleted: false,
            stock: { $gt: 0 }
        })
        .select("title slug thumbnail price discountPercentage")
        .limit(8)
        .lean();

        const results = products.map(p => {
            const priceNew = p.discountPercentage
                ? Math.round(p.price * (1 - p.discountPercentage / 100))
                : p.price;
            return {
                title: p.title,
                slug: p.slug,
                thumbnail: p.thumbnail || "",
                price: p.price,
                priceNew: priceNew,
                discount: p.discountPercentage || 0
            };
        });

        res.json(results);
    } catch (error) {
        res.json([]);
    }
}

// [GET] /products/by-ids?ids=id1,id2,id3 - Lịch sử xem
module.exports.getByIds = async (req, res) => {
    try {
        const ids = req.query.ids ? req.query.ids.split(",").filter(Boolean) : [];
        if (ids.length === 0) return res.json([]);

        const products = await Product.find({
            _id: { $in: ids },
            status: "active",
            deleted: false
        }).select("title slug thumbnail price discountPercentage").lean();

        // Giữ đúng thứ tự IDs
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        const ordered = ids
            .map(id => productMap[id])
            .filter(Boolean)
            .map(p => ({
                _id: p._id,
                title: p.title,
                slug: p.slug,
                thumbnail: p.thumbnail,
                price: p.price,
                priceNew: p.discountPercentage
                    ? Math.round(p.price * (1 - p.discountPercentage / 100))
                    : p.price,
                discount: p.discountPercentage || 0
            }));

        res.json(ordered);
    } catch (error) {
        res.json([]);
    }
};