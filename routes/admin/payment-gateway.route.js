const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/payment-gateway.controller");

const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.patch("/change-multi", auth.requirePermission("payment-gateways_edit"), controller.changeMulti);
router.patch("/change-status/:status/:id", auth.requirePermission("payment-gateways_change-status"), controller.changeStatus);
router.get("/create", auth.requirePermission("payment-gateways_create"), controller.create);
router.post("/create", auth.requirePermission("payment-gateways_create"), controller.createPost);
router.delete("/delete/:id", auth.requirePermission("payment-gateways_delete"), controller.deleteRecord);
router.get("/edit/:id", auth.requirePermission("payment-gateways_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("payment-gateways_edit"), controller.editPatch);

module.exports = router;
