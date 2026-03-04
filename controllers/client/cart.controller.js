const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const FlashSale = require("../../models/flash-sale.model");
const {
    getDiscountedPrice,
    getCartTotalQuantity,
    calculateCartTotal
} = require("../../helpers/product");
const vnpayHelper = require("../../helpers/vnpay");
const discountService = require("../../services/discount.service");
const { calculateShippingFee, getProvinceList } = require("../../helpers/shipping");

// Helper: Lấy cartItems và cartTotal từ Cart document
const getCartDetails = async (cart) => {
    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({
        _id: { $in: productIds },
        deleted: false
    });

    const cartItems = [];
    let cartTotal = 0;

    for (const item of cart.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const unitPrice = getDiscountedPrice(product);
            const itemTotal = unitPrice * item.quantity;
            cartTotal += itemTotal;

            cartItems.push({
                product,
                quantity: item.quantity,
                unitPrice,
                itemTotal
            });
        }
    }

    return { cartItems, cartTotal };
};

// [GET] /cart
module.exports.index = async (req, res) => {
    try {
        const cart = req.cart; // Middleware đã gán sẵn

        const { cartItems, cartTotal } = await getCartDetails(cart);

        res.render("client/pages/cart/index", {
            title: "Giỏ hàng",
            cartItems,
            cartTotal
        });
    } catch (error) {
        console.log("Cart index error:", error);
        res.render("client/pages/cart/index", {
            title: "Giỏ hàng",
            cartItems: [],
            cartTotal: 0
        });
    }
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;
        const isAjax = req.headers.accept && req.headers.accept.includes("application/json");

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findOne({
            _id: productId,
            status: "active",
            deleted: false
        });

        if (!product) {
            if (isAjax) return res.json({ success: false, message: "Sản phẩm không tồn tại" });
            return res.redirect("back");
        }

        const cart = req.cart;

        // Check if item exceeds standard stock or flash sale limit
        let maxStock = product.stock;
        
        // Find if this product has an active flash sale (to check flash stock logic)
        const FlashSale = require("../../models/flash-sale.model");
        const now = new Date();
        const activeFlashSale = await FlashSale.findOne({
            status: "active", deleted: false,
            startTime: { $lte: now }, endTime: { $gte: now },
            "products.product_id": product._id
        });

        if (activeFlashSale) {
            const fp = activeFlashSale.products.find(p => p.product_id.toString() === productId);
            if (fp && fp.sold < fp.stock) {
                // If there's an active flash sale, we want to restrict to remaining flash stock
                const remainingFlashStock = fp.stock - (fp.sold || 0);
                if (remainingFlashStock < maxStock) {
                    maxStock = remainingFlashStock;
                }
            } else if (fp && fp.sold >= fp.stock) {
                // Flash sale stock ended. Standard rules apply
                maxStock = product.stock;
            }
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItem = cart.items.find(
            item => item.productId === productId
        );

        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newTotalQuantity = currentQuantity + quantity;

        if (newTotalQuantity > maxStock) {
            if (isAjax) return res.json({ success: false, message: `Số lượng vượt quá giới hạn (có sẵn: ${maxStock})`});
            req.flash("error", `Không thể thêm! Khả dụng: ${maxStock} sản phẩm`);
            return res.redirect("back");
        }

        if (existingItem) {
            // Đã có -> cộng thêm số lượng
            await Cart.updateOne(
                { _id: cart._id, "items.productId": productId },
                { $inc: { "items.$.quantity": quantity } }
            );
        } else {
            // Chưa có -> thêm mới
            await Cart.updateOne(
                { _id: cart._id },
                { $push: { items: { productId, quantity } } }
            );
        }

        if (req.body.buyNow === "true") {
            return res.redirect("/cart/checkout");
        }

        // Nếu là gọi AJAX thì trả về JSON + tổng số sản phẩm mới
        if (isAjax || req.xhr) {
            // Lấy lại cart để đếm tổng số lượng chính xác
            const updatedCart = await Cart.findById(cart._id);
            const totalQuantity = getCartTotalQuantity(updatedCart.items);
            return res.json({ success: true, message: "Đã thêm vào giỏ hàng!", cartTotalQuantity: totalQuantity });
        }

        req.flash("success", "Đã thêm sản phẩm vào giỏ hàng!");
        res.redirect("back");
    } catch (error) {
        console.log("Add to cart error:", error);
        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            return res.json({ success: false, message: "Lỗi thêm giỏ hàng" });
        }
        res.redirect("back");
    }
};

// [PATCH] /cart/update/:productId (AJAX)
module.exports.update = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity);

        if (!quantity || quantity < 1) {
            return res.json({ success: false, message: "Số lượng không hợp lệ" });
        }

        // Kiểm tra sản phẩm tồn tại
        const targetProduct = await Product.findOne({
            _id: productId,
            status: "active",
            deleted: false
        });

        if (!targetProduct) {
            return res.json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        let maxStock = targetProduct.stock;

        // Find if this product has an active flash sale
        const FlashSale = require("../../models/flash-sale.model");
        const now = new Date();
        const activeFlashSale = await FlashSale.findOne({
            status: "active", deleted: false,
            startTime: { $lte: now }, endTime: { $gte: now },
            "products.product_id": productId
        });

        if (activeFlashSale) {
            const fp = activeFlashSale.products.find(p => p.product_id.toString() === productId);
            if (fp && fp.sold < fp.stock) {
                const remainingFlashStock = fp.stock - (fp.sold || 0);
                if (remainingFlashStock < maxStock) {
                    maxStock = remainingFlashStock;
                }
            }
        }

        if (quantity > maxStock) {
            return res.json({ success: false, message: `Chỉ còn ${maxStock} sản phẩm khả dụng`});
        }

        const currentCart = await Cart.findById(cart._id);
        const existingItem = currentCart.items.find(
            item => item.productId === productId
        );

        if (!existingItem) {
            return res.json({ success: false, message: "Sản phẩm không tồn tại trong giỏ" });
        }

        // Cập nhật số lượng trong DB
        await Cart.updateOne(
            { _id: cart._id, "items.productId": productId },
            { $set: { "items.$.quantity": quantity } }
        );

        // Tính lại tổng
        const product = await Product.findById(productId);
        const unitPrice = getDiscountedPrice(product);
        const itemTotal = unitPrice * quantity;

        // Lấy cart mới từ DB để tính tổng chính xác
        const updatedCart = await Cart.findById(cart._id);
        const productIds = updatedCart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, deleted: false });
        const cartTotal = calculateCartTotal(updatedCart.items, products);

        res.json({
            success: true,
            cartTotalQuantity: getCartTotalQuantity(updatedCart.items),
            itemTotal,
            cartTotal
        });
    } catch (error) {
        console.log("Update cart error:", error);
        res.json({ success: false, message: "Lỗi cập nhật" });
    }
};

// [DELETE] /cart/remove/:productId (AJAX)
module.exports.remove = async (req, res) => {
    try {
        const productId = req.params.productId;

        const cart = req.cart;

        // Xóa item khỏi giỏ trong DB
        await Cart.updateOne(
            { _id: cart._id },
            { $pull: { items: { productId: productId } } }
        );

        // Lấy cart mới từ DB để tính tổng
        const updatedCart = await Cart.findById(cart._id);
        const productIds = updatedCart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, deleted: false });
        const cartTotal = calculateCartTotal(updatedCart.items, products);

        res.json({
            success: true,
            cartTotalQuantity: getCartTotalQuantity(updatedCart.items),
            cartTotal
        });
    } catch (error) {
        console.log("Remove from cart error:", error);
        res.json({ success: false, message: "Lỗi xóa sản phẩm" });
    }
};

// [GET] /cart/checkout
module.exports.checkout = async (req, res) => {
    try {
        const cart = req.cart;

        if (cart.items.length === 0) {
            return res.redirect("/cart");
        }

        const { cartItems, cartTotal } = await getCartDetails(cart);

        let defaultAddress = null;
        if (res.locals.clientUser && res.locals.clientUser.addresses) {
            if (req.query.addressId) {
                defaultAddress = res.locals.clientUser.addresses.find(addr => addr._id.toString() === req.query.addressId);
            }
            if (!defaultAddress) {
                defaultAddress = res.locals.clientUser.addresses.find(addr => addr.isDefault) || res.locals.clientUser.addresses[0];
            }
        }

        res.render("client/pages/cart/checkout", {
            title: "Thanh toán",
            cartItems,
            cartTotal,
            defaultAddress,
            req: req
        });
    } catch (error) {
        console.log("Checkout error:", error);
        res.redirect("/cart");
    }
};

// [POST] /cart/checkout
module.exports.checkoutPost = async (req, res) => {
    try {
        const cart = req.cart;

        if (cart.items.length === 0) {
            req.flash("error", "Giỏ hàng trống!");
            return res.redirect("/cart");
        }

        const { customerName, customerPhone, customerAddress, customerNote } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            req.flash("error", "Vui lòng điền đầy đủ thông tin!");
            return res.redirect("/cart/checkout");
        }

        // Lấy thông tin sản phẩm
        const productIds = cart.items.map(item => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            deleted: false
        });

        const items = [];
        let totalAmount = 0;

        for (const cartItem of cart.items) {
            const product = products.find(p => p.id === cartItem.productId);
            if (product) {
                const unitPrice = getDiscountedPrice(product);
                const itemTotal = unitPrice * cartItem.quantity;
                totalAmount += itemTotal;

                items.push({
                    productId: product._id,
                    title: product.title,
                    thumbnail: product.thumbnail,
                    price: product.price,
                    discountPercentage: product.discountPercentage || 0,
                    unitPrice,
                    quantity: cartItem.quantity,
                    itemTotal
                });

                // Trừ stock
                await Product.updateOne(
                    { _id: product._id },
                    { $inc: { stock: -cartItem.quantity } }
                );

                // Cập nhật Flash Sale sold nếu sản phẩm nằm trong Flash Sale đang diễn ra
                const now = new Date();
                await FlashSale.updateOne(
                    {
                        status: "active",
                        deleted: false,
                        startTime: { $lte: now },
                        endTime: { $gte: now },
                        "products.product_id": product._id
                    },
                    {
                        $inc: { "products.$.sold": cartItem.quantity }
                    }
                );
            }
        }

        // Xử lý phương thức thanh toán
        const paymentMethod = req.body.paymentMethod || "cod";

        // Áp dụng mã giảm giá (nếu có)
        let discountAmount = 0;
        let discountCode = "";
        if (req.body.discountCode) {
            try {
                const result = await discountService.applyCode(req.body.discountCode, totalAmount);
                discountAmount = result.discountAmount;
                discountCode = result.discount.code;
                await discountService.incrementUsage(discountCode);
            } catch (e) {
                // Mã không hợp lệ → bỏ qua, không block đặt hàng
            }
        }

        const finalAmount = totalAmount - discountAmount;

        // Tạo đơn hàng
        const order = new Order({
            userId: res.locals.clientUser ? res.locals.clientUser.id : "",
            customerName,
            customerPhone,
            customerAddress,
            customerNote: customerNote || "",
            items,
            totalAmount: finalAmount,
            discountCode: discountCode,
            discountAmount: discountAmount,
            paymentMethod: paymentMethod,
            paymentStatus: "unpaid"
        });
        await order.save();

        // Xóa giỏ hàng trong DB (chỉ xóa items, giữ lại Cart)
        await Cart.updateOne(
            { _id: cart._id },
            { $set: { items: [] } }
        );

        // Xử lý VNPay redirect hoặc render COD success
        if (paymentMethod === "vnpay") {
            // Lấy IP client
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress || "127.0.0.1";

            const vnpayInfo = vnpayHelper.createPaymentUrl(order.id, totalAmount, ipAddr);

            // Lưu txnRef vào đơn hàng để đối chiếu
            await Order.updateOne({ _id: order.id }, { vnpayTransactionNo: vnpayInfo.txnRef });

            return res.redirect(vnpayInfo.paymentUrl);
        }

        res.render("client/pages/cart/checkout-success", {
            title: "Đặt hàng thành công",
            order
        });
    } catch (error) {
        console.log("Checkout post error:", error);
        req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
        res.redirect("/cart/checkout");
    }
};

// [POST] /cart/apply-discount (AJAX)
module.exports.applyDiscount = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        if (!code) {
            return res.json({ code: 400, message: "Vui lòng nhập mã giảm giá!" });
        }

        const total = parseInt(cartTotal) || 0;
        const result = await discountService.applyCode(code, total);

        res.json({
            code: 200,
            message: "Áp dụng mã giảm giá thành công!",
            discountCode: result.discount.code,
            discountAmount: result.discountAmount,
            finalTotal: result.finalTotal,
            description: result.discount.description
        });
    } catch (error) {
        let message = "Có lỗi xảy ra!";
        if (error.message === "INVALID_CODE") message = "Mã giảm giá không hợp lệ hoặc đã hết hạn!";
        else if (error.message === "USAGE_LIMIT_REACHED") message = "Mã giảm giá đã hết lượt sử dụng!";
        else if (error.message.startsWith("MIN_ORDER:")) {
            const min = parseInt(error.message.split(":")[1]);
            message = `Đơn hàng tối thiểu ${min.toLocaleString("vi-VN")}₫ để áp dụng mã này!`;
        }
        res.json({ code: 400, message });
    }
};

// [GET] /cart/vnpay-return
module.exports.vnpayReturn = async (req, res) => {
    try {
        let vnpParams = req.query;

        // Verify checksum
        const isSecure = vnpayHelper.verifyReturnUrl(vnpParams);

        if (isSecure) {
            // response code vnpay trả về
            const rspCode = vnpParams['vnp_ResponseCode'];
            const txnRef = vnpParams['vnp_TxnRef']; // orderId_timestamp

            // Tìm đơn hàng theo txnRef
            const order = await Order.findOne({ vnpayTransactionNo: txnRef });

            if (!order) {
                req.flash("error", "Không tìm thấy đơn hàng!");
                return res.redirect("/");
            }

            if (rspCode === "00") {
                // Thanh toán thành công -> Cập nhật paymentStatus
                await Order.updateOne(
                    { _id: order.id },
                    { paymentStatus: "paid" }
                );

                res.render("client/pages/cart/checkout-success", {
                    title: "Đặt hàng thành công",
                    order,
                    paymentMessage: "Thanh toán VNPay thành công!"
                });
            } else {
                // Thanh toán thất bại -> Hủy/Pending
                await Order.updateOne(
                    { _id: order.id },
                    { status: "cancelled", paymentStatus: "unpaid" }
                );

                req.flash("error", "Thanh toán thất bại hoặc đã bị hủy!");
                res.redirect("/cart/checkout");
            }
        } else {
            req.flash("error", "Tham số không hợp lệ. Sai checksum!");
            res.redirect("/");
        }
    } catch (error) {
        console.log("VNPay return error: ", error);
        req.flash("error", "Có lỗi xảy ra khi xác nhận thanh toán!");
        res.redirect("/");
    }
};

// [GET] /cart/shipping/fee?province=Hà Nội
module.exports.getShippingFee = (req, res) => {
    const province = req.query.province || "";
    const result = calculateShippingFee(province);
    res.json({
        code: 200,
        ...result,
        feeFormatted: result.fee.toLocaleString("vi-VN") + "đ"
    });
};

// [GET] /cart/provinces  - trả về danh sách tỉnh cho autocomplete
module.exports.getProvinces = (req, res) => {
    res.json({ code: 200, provinces: getProvinceList() });
};
