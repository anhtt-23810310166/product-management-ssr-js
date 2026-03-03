const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Article = require("../../models/article.model");
const FlashSale = require("../../models/flash-sale.model");

// [GET] /
module.exports.index = async (req, res) => {
    try {
        // Sản phẩm nổi bật
        const featuredProducts = await Product.find({
            featured: true,
            status: "active",
            deleted: false,
            stock: { $gt: 0 }
        }).sort({ position: "desc" }).limit(4);

        // Sản phẩm mới nhất
        const newestProducts = await Product.find({
            status: "active",
            deleted: false,
            stock: { $gt: 0 }
        }).sort({ createdAt: -1 }).limit(4);

        // Bài viết mới nhất cho trang chủ
        const featuredArticles = await Article.find({
            status: "active",
            deleted: false
        }).sort({ position: "desc", createdAt: -1 }).limit(6);

        // Flash Sale đang diễn ra
        const now = new Date();
        let flashSale = null;
        const activeFlashSale = await FlashSale.findOne({
            status: "active",
            deleted: false,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).sort({ createdAt: -1 });

        if (activeFlashSale && activeFlashSale.products.length > 0) {
            const productIds = activeFlashSale.products.map(p => p.product_id);
            const flashProducts = await Product.find({
                _id: { $in: productIds },
                deleted: false,
                status: "active"
            });

            const flashSaleProducts = activeFlashSale.products.map(fp => {
                const prod = flashProducts.find(p => p._id.toString() === fp.product_id.toString());
                if (!prod) return null;
                return {
                    ...prod.toObject(),
                    flashDiscountPercentage: fp.discountPercentage,
                    flashStock: fp.stock,
                    flashSold: fp.sold
                };
            }).filter(p => p && p.flashSold < p.flashStock); // Ẩn sản phẩm flash sale nếu đã bán hết số lượng cho phép

            flashSale = {
                title: activeFlashSale.title,
                endTime: activeFlashSale.endTime,
                products: flashSaleProducts
            };
        }

        res.render("client/pages/home/index", {
            title: "Trang chủ",
            featuredProducts,
            newestProducts,
            featuredArticles,
            flashSale
        });
    } catch (error) {
        console.log(error);
        res.render("client/pages/home/index", {
            title: "Trang chủ",
            featuredProducts: [],
            newestProducts: [],
            featuredArticles: [],
            flashSale: null
        });
    }
}
