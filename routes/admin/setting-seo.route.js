const express = require("express");
const router = express.Router();
const upload = require("../../helpers/upload");

const controller = require("../../controllers/admin/setting-seo.controller");

router.get("/", controller.index);

router.patch(
    "/",
    upload.single("ogImage"),
    controller.editPatch
);

module.exports = router;
