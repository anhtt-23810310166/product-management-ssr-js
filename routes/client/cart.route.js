const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/cart.controller");

router.get("/", controller.index);
router.get("/checkout", controller.checkout);
router.post("/checkout", controller.checkoutPost);
router.post("/add/:productId", controller.addPost);
router.patch("/update/:productId", controller.update);
router.delete("/remove/:productId", controller.remove);

// Áp dụng mã giảm giá
router.post("/apply-discount", controller.applyDiscount);

// VNPay return callback
router.get("/vnpay-return", controller.vnpayReturn);

module.exports = router;
