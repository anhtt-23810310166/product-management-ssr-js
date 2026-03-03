const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema({
    title: String,
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    products: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            discountPercentage: {
                type: Number,
                default: 0
            },
            stock: {
                type: Number,
                default: 0
            },
            sold: {
                type: Number,
                default: 0
            }
        }
    ],
    status: {
        type: String,
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

const FlashSale = mongoose.model("FlashSale", flashSaleSchema);

module.exports = FlashSale;
