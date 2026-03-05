const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/dashboard.controller");

router.get("/", controller.dashboard);
router.get("/chart-data", controller.chartData);

module.exports = router;