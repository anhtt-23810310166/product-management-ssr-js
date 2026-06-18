const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/setting.controller");
const upload = require("../../helpers/upload");

router.get("/", (req, res) => {
    res.render("admin/pages/setting/index", {
        pageTitle: "Cài đặt chung",
        currentPage: "settings",
        breadcrumbs: [{ title: "Cài đặt" }]
    });
});

router.get("/general", controller.general);

router.patch(
    "/general",
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "heroBannerImage", maxCount: 1 },
        { name: "doubleBannerImage0", maxCount: 1 },
        { name: "doubleBannerImage1", maxCount: 1 }
    ]),
    controller.generalPatch
);

module.exports = router;
