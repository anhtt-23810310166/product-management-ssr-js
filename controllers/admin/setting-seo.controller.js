const SettingSeo = require("../../models/setting-seo.model");

// [GET] /admin/settings/seo
module.exports.index = async (req, res) => {
    let settingSeo = await SettingSeo.findOne({});

    if (!settingSeo) {
        settingSeo = new SettingSeo({
            metaTitle: "TechZone - Cửa hàng điện thoại và phụ kiện",
            metaDescription: "Khám phá các sản phẩm công nghệ chất lượng cao tại TechZone.",
            metaKeywords: "TechZone, điện thoại, phụ kiện",
            robotsTxt: "User-agent: *\nAllow: /\nSitemap: http://localhost:3000/sitemap.xml"
        });
        await settingSeo.save();
    }

    res.render("admin/pages/setting-seo/index", {
        pageTitle: "Cấu hình SEO",
        currentPage: "settings",
        breadcrumbs: [
            { title: "Cài đặt", link: `${res.locals.prefixAdmin}/settings` },
            { title: "SEO" }
        ],
        settingSeo: settingSeo
    });
};

// [PATCH] /admin/settings/seo
module.exports.editPatch = async (req, res) => {
    try {
        if (req.file) {
            req.body.ogImage = req.file.path;
        }
        const settingSeo = await SettingSeo.findOne({});
        if (settingSeo) {
            await SettingSeo.updateOne({ _id: settingSeo.id }, req.body);
        } else {
            const record = new SettingSeo(req.body);
            await record.save();
        }

        req.flash("success", "Cập nhật cấu hình SEO thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
    }

    res.redirect("back");
};
