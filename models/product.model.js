const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const productSchema = new mongoose.Schema({
    title: String,
    product_category_id: {
        type: String,
        default: ""
    },
    brand_id: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    images: {
        type: [String],
        default: []
    },
    variants: {
        type: [
            {
                name: { type: String, default: "" },
                value: { type: String, default: "" },
                price: { type: Number, default: 0 },
                stock: { type: Number, default: 0 },
                sku: { type: String, default: "" }
            }
        ],
        default: []
    },
    status: String,
    featured: {
        type: Boolean,
        default: false
    },
    position: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

productSchema.plugin(slug);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
