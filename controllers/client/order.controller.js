const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const PDFDocument = require("pdfkit");

// [GET] /orders
module.exports.index = async (req, res) => {
    try {
        const userId = res.locals.clientUser ? res.locals.clientUser.id : null;
        if (!userId) {
            req.flash("error", "Bạn cần đăng nhập để xem lịch sử đơn hàng!");
            return res.redirect("/user/login");
        }

        const find = {
            userId: userId,
            deleted: false
        };

        // Status filter from query
        const filterStatus = req.query.status || '';
        if (filterStatus && ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].includes(filterStatus)) {
            find.status = filterStatus;
        }

        const orders = await Order.find(find).sort({ createdAt: -1 });

        // Map status labels
        const statusLabels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            shipping: "Đang giao",
            delivered: "Đã giao",
            cancelled: "Đã hủy"
        };

        res.render("client/pages/orders/index.pug", {
            title: "Đơn hàng của tôi",
            orders: orders,
            statusLabels: statusLabels,
            filterStatus: filterStatus
        });
    } catch (error) {
        console.error("Order history error:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/");
    }
};

// [GET] /orders/:id
module.exports.detail = async (req, res) => {
    try {
        const userId = res.locals.clientUser ? res.locals.clientUser.id : null;
        if (!userId) {
            req.flash("error", "Bạn cần đăng nhập!");
            return res.redirect("/user/login");
        }

        const order = await Order.findOne({
            _id: req.params.id,
            userId: userId,
            deleted: false
        });

        if (!order) {
            req.flash("error", "Đơn hàng không tồn tại!");
            return res.redirect("/orders");
        }

        const statusLabels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            shipping: "Đang giao",
            delivered: "Đã giao",
            cancelled: "Đã hủy"
        };

        const statusColors = {
            pending: "warning",
            confirmed: "info",
            shipping: "primary",
            delivered: "success",
            cancelled: "danger"
        };

        // Lấy slug sản phẩm để tạo link
        const productIds = order.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } }).select("slug");
        const productSlugs = {};
        products.forEach(p => {
            productSlugs[p._id.toString()] = p.slug;
        });

        res.render("client/pages/orders/detail.pug", {
            title: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
            order: order,
            statusLabels: statusLabels,
            statusColors: statusColors,
            productSlugs: productSlugs
        });
    } catch (error) {
        console.error("Order detail error:", error);
        req.flash("error", "Co loi xay ra!");
        res.redirect("/orders");
    }
};

// [GET] /orders/:id/invoice - Xuất hóa đơn PDF
module.exports.invoice = async (req, res) => {
    try {
        const userId = res.locals.clientUser ? res.locals.clientUser.id : null;
        if (!userId) {
            req.flash("error", "Bạn cần đăng nhập!");
            return res.redirect("/user/login");
        }

        const order = await Order.findOne({
            _id: req.params.id,
            userId: userId,
            deleted: false
        });

        if (!order) {
            req.flash("error", "Đơn hàng không tồn tại!");
            return res.redirect("/orders");
        }

        const orderCode = order._id.toString().slice(-8).toUpperCase();
        const path = require("path");
        const fontPath = path.join(__dirname, "../../public/fonts/ArialUnicode.ttf");

        // Tạo PDF dùng Arial Unicode (hỗ trợ tiếng Việt đầy đủ)
        const doc = new PDFDocument({ size: "A4", margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=HoaDon_${orderCode}.pdf`);
        doc.pipe(res);

        // Đăng ký font
        doc.registerFont("Regular", fontPath);
        doc.registerFont("Bold", fontPath); // Arial Unicode chỉ có 1 style

        // ===== HEADER =====
        doc.fontSize(24).font("Bold").fillColor("#1a1a2e").text("TECHZONE", 50, 50);
        doc.fontSize(9).font("Regular").fillColor("#666").text("Nền tảng thương mại điện tử", 50, 78);

        // Logo badge phải
        doc.rect(420, 45, 125, 40).fillColor("#3498db").fill();
        doc.fontSize(9).font("Regular").fillColor("#fff").text("HÓA ĐƠN BÁN HÀNG", 430, 49, { width: 105, align: "center" });
        doc.fontSize(7).fillColor("#e8f4fd").text("INVOICE", 430, 63, { width: 105, align: "center" });

        // Đường kẻ header
        doc.moveTo(50, 98).lineTo(545, 98).strokeColor("#3498db").lineWidth(2).stroke();

        // ===== INVOICE INFO =====
        const dateStr = new Date(order.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        doc.fontSize(10).font("Regular").fillColor("#555");
        doc.text("Mã đơn hàng: #" + orderCode, 50, 112);
        doc.text("Ngày đặt: " + dateStr, 50, 127);

        // ===== THÔNG TIN KHÁCH HÀNG =====
        let y = 155;
        doc.rect(50, y, 495, 20).fillColor("#f0f4f8").fill();
        doc.fontSize(10).font("Bold").fillColor("#2c3e50").text("THÔNG TIN KHÁCH HÀNG", 58, y + 5);

        y += 28;
        doc.fontSize(9).fillColor("#333");
        doc.font("Bold").text("Họ tên:", 58, y);
        doc.font("Regular").text(order.customerName, 130, y);

        y += 16;
        doc.font("Bold").text("Điện thoại:", 58, y);
        doc.font("Regular").text(order.customerPhone, 130, y);

        y += 16;
        doc.font("Bold").text("Địa chỉ:", 58, y);
        doc.font("Regular").text(order.customerAddress, 130, y, { width: 410 });

        if (order.customerNote) {
            y += 16;
            doc.font("Bold").text("Ghi chú:", 58, y);
            doc.font("Regular").fillColor("#666").text(order.customerNote, 130, y, { width: 410 });
        }

        // ===== BẢNG SẢN PHẨM =====
        y += 24;
        const tableTop = y;
        const COL = { stt: 50, name: 78, qty: 340, unitPrice: 380, total: 470 };

        // Header bảng
        doc.rect(50, tableTop, 495, 22).fillColor("#2c3e50").fill();
        doc.fontSize(9).font("Bold").fillColor("#ffffff");
        doc.text("STT", COL.stt + 4, tableTop + 6, { width: 24, align: "center" });
        doc.text("Tên sản phẩm", COL.name + 4, tableTop + 6, { width: 255 });
        doc.text("SL", COL.qty + 4, tableTop + 6, { width: 35, align: "center" });
        doc.text("Đơn giá", COL.unitPrice + 4, tableTop + 6, { width: 82, align: "right" });
        doc.text("Thành tiền", COL.total + 4, tableTop + 6, { width: 66, align: "right" });

        // Rows
        let rowY = tableTop + 25;
        order.items.forEach((item, idx) => {
            const bg = idx % 2 === 0 ? "#f9fbfc" : "#ffffff";
            doc.rect(50, rowY - 2, 495, 20).fillColor(bg).fill();
            doc.fillColor("#333").font("Regular").fontSize(9);

            doc.text(String(idx + 1), COL.stt + 4, rowY + 2, { width: 24, align: "center" });
            const titleCut = item.title.length > 38 ? item.title.substring(0, 38) + "…" : item.title;
            doc.text(titleCut, COL.name + 4, rowY + 2, { width: 255 });
            doc.text(String(item.quantity), COL.qty + 4, rowY + 2, { width: 35, align: "center" });
            doc.text(item.unitPrice.toLocaleString("vi-VN") + "đ", COL.unitPrice + 4, rowY + 2, { width: 82, align: "right" });
            doc.text(item.itemTotal.toLocaleString("vi-VN") + "đ", COL.total + 4, rowY + 2, { width: 66, align: "right" });

            rowY += 20;
        });

        // Đường kẻ dưới bảng
        doc.moveTo(50, rowY + 2).lineTo(545, rowY + 2).strokeColor("#bdc3c7").lineWidth(1).stroke();

        // ===== THANH TOÁN & TỔNG =====
        rowY += 16;

        // Phương thức thanh toán - 1 dòng riêng
        const payLabel = order.paymentMethod === "vnpay" ? "VNPay (đã thanh toán online)" : "Thanh toán khi nhận hàng (COD)";
        doc.fontSize(9).font("Regular").fillColor("#555");
        doc.text("Phương thức thanh toán:", 50, rowY);
        doc.font("Bold").fillColor("#333").text(payLabel, 190, rowY);

        // Tổng cộng - 1 dòng riêng, xuống thêm
        rowY += 20;
        doc.rect(330, rowY - 4, 215, 26).fillColor("#fef9e7").fill();
        doc.fontSize(11).font("Bold").fillColor("#2c3e50").text("TỔNG CỘNG:", 338, rowY + 2);
        doc.fillColor("#e74c3c").text(order.totalAmount.toLocaleString("vi-VN") + " VND", 420, rowY + 2, { width: 118, align: "right" });

        // ===== FOOTER =====
        rowY += 55;
        doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#eee").lineWidth(1).stroke();
        rowY += 10;
        doc.fontSize(8).font("Regular").fillColor("#aaa");
        doc.text("Cảm ơn bạn đã mua hàng tại TechZone! • support@techzone.vn", 50, rowY, { align: "center", width: 495 });

        doc.end();

    } catch (error) {
        console.error("Invoice PDF error:", error);
        req.flash("error", "Không thể tạo hóa đơn!");
        res.redirect("/orders");
    }
};
