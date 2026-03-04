const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/wishlist.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.use(authMiddleware.requireAuth);

router.get("/", controller.index);
router.post("/toggle", controller.toggle);

module.exports = router;
