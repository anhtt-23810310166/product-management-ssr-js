const BaseService = require("./base.service");
const Product = require("../models/product.model");

class ProductService extends BaseService {
    constructor() {
        super(Product, "products", { searchField: "title", nameField: "title" });
    }

    /**
     * Thêm sản phẩm
     */
    async create(data, files) {
        data.price = parseInt(data.price) || 0;
        data.discountPercentage = parseInt(data.discountPercentage) || 0;
        data.stock = parseInt(data.stock) || 0;
        data.position = await this.autoPosition(data.position);

        if (files && files["thumbnail"] && files["thumbnail"].length > 0) {
            data.thumbnail = files["thumbnail"][0].path;
        }

        // Xử lý nhiều ảnh phụ
        if (files && files["images"] && files["images"].length > 0) {
            data.images = files["images"].map(file => file.path);
        }

        // Xử lý biến thể
        data.variants = this._parseVariants(data);

        const product = new this.Model(data);
        await product.save();
        return product;
    }

    /**
     * Cập nhật sản phẩm
     */
    async update(id, data, files) {
        const product = await this.Model.findById(id);
        if (!product) {
            throw new Error("NOT_FOUND");
        }

        product.title = data.title;
        product.product_category_id = data.product_category_id || "";
        product.brand_id = data.brand_id || "";
        product.description = data.description;
        product.price = parseInt(data.price) || 0;
        product.discountPercentage = parseInt(data.discountPercentage) || 0;
        product.stock = parseInt(data.stock) || 0;
        product.position = parseInt(data.position) || 0;
        product.status = data.status;
        product.featured = data.featured === "true" ? true : false;

        if (files && files["thumbnail"] && files["thumbnail"].length > 0) {
            product.thumbnail = files["thumbnail"][0].path;
        }

        // Xử lý xóa ảnh phụ cũ
        if (data.deletedImages) {
            const deletedImages = Array.isArray(data.deletedImages)
                ? data.deletedImages
                : [data.deletedImages];
            product.images = (product.images || []).filter(img => !deletedImages.includes(img));
        }

        // Xử lý thêm ảnh phụ mới
        if (files && files["images"] && files["images"].length > 0) {
            const newImages = files["images"].map(file => file.path);
            product.images = [...(product.images || []), ...newImages];
        }

        // Xử lý biến thể
        product.variants = this._parseVariants(data);

        await product.save();
        return product;
    }

    /**
     * Parse variants từ form data
     * Form gửi: variantName[], variantValue[], variantPrice[], variantStock[], variantSku[]
     */
    _parseVariants(data) {
        const names = data["variantName"];
        if (!names) return [];

        const nameArr = Array.isArray(names) ? names : [names];
        const valueArr = Array.isArray(data["variantValue"]) ? data["variantValue"] : [data["variantValue"] || ""];
        const priceArr = Array.isArray(data["variantPrice"]) ? data["variantPrice"] : [data["variantPrice"] || "0"];
        const stockArr = Array.isArray(data["variantStock"]) ? data["variantStock"] : [data["variantStock"] || "0"];
        const skuArr = Array.isArray(data["variantSku"]) ? data["variantSku"] : [data["variantSku"] || ""];

        const variants = [];
        for (let i = 0; i < nameArr.length; i++) {
            const name = (nameArr[i] || "").trim();
            const value = (valueArr[i] || "").trim();
            if (!name && !value) continue;

            variants.push({
                name: name,
                value: value,
                price: parseInt(priceArr[i]) || 0,
                stock: parseInt(stockArr[i]) || 0,
                sku: (skuArr[i] || "").trim()
            });
        }
        return variants;
    }
}

module.exports = new ProductService();
