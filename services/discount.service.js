const BaseService = require("./base.service");
const Discount = require("../models/discount.model");

class DiscountService extends BaseService {
    constructor() {
        super(Discount, "discounts", { searchField: "code", nameField: "code" });
    }

    /**
     * Tạo mã giảm giá mới
     */
    async create(data) {
        data.code = (data.code || "").toUpperCase().trim();

        // Kiểm tra trùng mã
        const exists = await this.Model.findOne({ code: data.code, deleted: false });
        if (exists) {
            throw new Error("DUPLICATE_CODE");
        }

        const discount = new this.Model(data);
        await discount.save();
        return discount;
    }

    /**
     * Cập nhật mã giảm giá
     */
    async update(id, data) {
        data.code = (data.code || "").toUpperCase().trim();

        // Kiểm tra trùng mã (loại trừ chính nó)
        const exists = await this.Model.findOne({ code: data.code, deleted: false, _id: { $ne: id } });
        if (exists) {
            throw new Error("DUPLICATE_CODE");
        }

        await this.Model.updateOne({ _id: id }, data);
    }

    /**
     * Validate và tính discount amount cho 1 mã
     */
    async applyCode(code, cartTotal) {
        const now = new Date();
        const discount = await this.Model.findOne({
            code: code.toUpperCase().trim(),
            status: "active",
            deleted: false,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        if (!discount) {
            throw new Error("INVALID_CODE");
        }

        if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit) {
            throw new Error("USAGE_LIMIT_REACHED");
        }

        if (discount.minOrder > 0 && cartTotal < discount.minOrder) {
            throw new Error(`MIN_ORDER:${discount.minOrder}`);
        }

        let discountAmount = 0;
        if (discount.type === "percentage") {
            discountAmount = Math.round(cartTotal * discount.value / 100);
            if (discount.maxDiscount > 0 && discountAmount > discount.maxDiscount) {
                discountAmount = discount.maxDiscount;
            }
        } else {
            discountAmount = discount.value;
        }

        if (discountAmount > cartTotal) discountAmount = cartTotal;

        return {
            discount,
            discountAmount,
            finalTotal: cartTotal - discountAmount
        };
    }

    /**
     * Tăng usedCount sau khi đặt hàng thành công
     */
    async incrementUsage(code) {
        await this.Model.updateOne(
            { code: code.toUpperCase().trim() },
            { $inc: { usedCount: 1 } }
        );
    }
}

module.exports = new DiscountService();
