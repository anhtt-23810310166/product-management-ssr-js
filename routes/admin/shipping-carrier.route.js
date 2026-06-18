const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/shipping-carrier.controller");

const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.patch("/change-multi", auth.requirePermission("shipping-carriers_edit"), controller.changeMulti);
router.patch("/change-status/:status/:id", auth.requirePermission("shipping-carriers_change-status"), controller.changeStatus);
router.get("/create", auth.requirePermission("shipping-carriers_create"), controller.create);
router.post("/create", auth.requirePermission("shipping-carriers_create"), controller.createPost);
router.delete("/delete/:id", auth.requirePermission("shipping-carriers_delete"), controller.deleteRecord);
router.get("/edit/:id", auth.requirePermission("shipping-carriers_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("shipping-carriers_edit"), controller.editPatch);

module.exports = router;
