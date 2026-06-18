const SettingGeneral = require("../../models/setting-general.model");

// [GET] /admin/settings/general
module.exports.general = async (req, res) => {
    let settingGeneral = await SettingGeneral.findOne({});

    if (!settingGeneral) {
        settingGeneral = new SettingGeneral();
        await settingGeneral.save();
    }

    res.render("admin/pages/setting/general", {
        pageTitle: "Thông tin Website & Trang chủ",
        currentPage: "settings",
        breadcrumbs: [
            { title: "Cài đặt", link: `${res.locals.prefixAdmin}/settings` },
            { title: "Thông tin Website" }
        ],
        settingGeneral: settingGeneral
    });
};

// [PATCH] /admin/settings/general
module.exports.generalPatch = async (req, res) => {
    try {
        const body = req.body;
        
        // Parse features and doubleBanners arrays from body since they are sent as flat fields
        // Using body mapping
        const features = [];
        for (let i = 0; i < 4; i++) {
            if (body[`featureIcon${i}`] || body[`featureTitle${i}`]) {
                features.push({
                    icon: body[`featureIcon${i}`],
                    title: body[`featureTitle${i}`],
                    desc: body[`featureDesc${i}`]
                });
            }
        }

        const doubleBanners = [];
        for (let i = 0; i < 2; i++) {
            const dbanner = {
                title: body[`doubleBannerTitle${i}`],
                badge: body[`doubleBannerBadge${i}`],
                buttonText: body[`doubleBannerButtonText${i}`],
                link: body[`doubleBannerLink${i}`],
                image: body[`doubleBannerCurrentImage${i}`] // fallback
            };
            
            // If new file is uploaded
            if (req.files && req.files[`doubleBannerImage${i}`]) {
                dbanner.image = req.files[`doubleBannerImage${i}`][0].path;
            }
            doubleBanners.push(dbanner);
        }

        // Hero Banner Object
        const heroBanner = {
            title: body.heroBannerTitle,
            desc: body.heroBannerDesc,
            buttonText: body.heroBannerButtonText,
            buttonLink: body.heroBannerButtonLink,
            image: body.heroBannerCurrentImage // fallback
        };
        if (req.files && req.files["heroBannerImage"]) {
            heroBanner.image = req.files["heroBannerImage"][0].path;
        }

        const dataUpdate = {
            websiteName: body.websiteName,
            phone: body.phone,
            email: body.email,
            address: body.address,
            copyright: body.copyright,
            features: features,
            heroBanner: heroBanner,
            doubleBanners: doubleBanners
        };

        if (req.files && req.files["logo"]) {
            dataUpdate.logo = req.files["logo"][0].path;
        }

        const settingGeneral = await SettingGeneral.findOne({});

        if (settingGeneral) {
            await SettingGeneral.updateOne({ _id: settingGeneral.id }, dataUpdate);
        } else {
            const record = new SettingGeneral(dataUpdate);
            await record.save();
        }

        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    } catch (error) {
        console.log(error);
        req.flash("error", "Lỗi cập nhật cài đặt!");
        res.redirect("back");
    }
};
