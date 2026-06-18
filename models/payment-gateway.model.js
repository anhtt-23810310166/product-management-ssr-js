const mongoose = require("mongoose");

const paymentGatewaySchema = new mongoose.Schema(
    {
        name: String, // VNPay, ZaloPay
        code: String, // vnpay, zalopay
        appId: String,
        secretKey1: String,
        secretKey2: String,
        endpoint: String,
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

const PaymentGateway = mongoose.model(
    "PaymentGateway",
    paymentGatewaySchema,
    "payment-gateways"
);

module.exports = PaymentGateway;
