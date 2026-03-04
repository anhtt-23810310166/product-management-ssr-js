const User = require("../../models/user.model");
const Product = require("../../models/product.model");

// [GET] /wishlist
module.exports.index = async (req, res) => {
    try {
        const user = await User.findById(res.locals.clientUser.id);
        let products = [];

        if (user && user.wishlist && user.wishlist.length > 0) {
            products = await Product.find({
                _id: { $in: user.wishlist },
                status: "active",
                deleted: false
            }).lean();

            // Tính giá mới
            products = products.map(p => {
                p.priceNew = p.discountPercentage
                    ? Math.round(p.price * (1 - p.discountPercentage / 100))
                    : p.price;
                return p;
            });
        }

        res.render("client/pages/wishlist/index", {
            pageTitle: "Sản phẩm yêu thích",
            products: products
        });
    } catch (error) {
        req.flash("error", "Đã xảy ra lỗi!");
        res.redirect("/");
    }
};

// [POST] /wishlist/toggle
module.exports.toggle = async (req, res) => {
    try {
        const productId = req.body.productId;
        if (!productId) {
            return res.json({ code: 400, message: "Thiếu productId" });
        }

        const user = await User.findById(res.locals.clientUser.id);
        if (!user) {
            return res.json({ code: 401, message: "Chưa đăng nhập" });
        }

        const index = user.wishlist.indexOf(productId);
        let action = "";

        if (index === -1) {
            user.wishlist.push(productId);
            action = "added";
        } else {
            user.wishlist.splice(index, 1);
            action = "removed";
        }

        await user.save();

        res.json({
            code: 200,
            action: action,
            wishlistCount: user.wishlist.length,
            message: action === "added" ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích"
        });
    } catch (error) {
        res.json({ code: 500, message: "Đã xảy ra lỗi" });
    }
};
