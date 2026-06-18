const mongoose = require("mongoose");

const shippingCarrierSchema = new mongoose.Schema(
    {
        name: String,
        baseFee: {
            type: Number,
            default: 0
        },
        logo: String,
        status: {
            type: String,
            default: "active"
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

const ShippingCarrier = mongoose.model(
    "ShippingCarrier",
    shippingCarrierSchema,
    "shipping-carriers"
);

module.exports = ShippingCarrier;
