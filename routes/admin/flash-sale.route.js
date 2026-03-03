const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/flash-sale.controller");
const validate = require("../../validates/admin/flash-sale.validate");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", validate.createPost, controller.createPost);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", validate.editPatch, controller.editPatch);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deleteFlashSale);

module.exports = router;
