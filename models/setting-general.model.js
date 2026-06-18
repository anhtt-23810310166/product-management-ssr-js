const mongoose = require("mongoose");

const settingGeneralSchema = new mongoose.Schema(
    {
        websiteName: String,
        logo: String,
        phone: String,
        email: String,
        address: String,
        copyright: String,
        heroBanner: {
            image: String,
            title: String,
            desc: String,
            buttonText: String,
            buttonLink: String
        },
        features: [
            {
                icon: String,
                title: String,
                desc: String
            }
        ],
        doubleBanners: [
            {
                image: String,
                title: String,
                badge: String,
                buttonText: String,
                link: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const SettingGeneral = mongoose.model(
    "SettingGeneral",
    settingGeneralSchema,
    "settings-general"
);

module.exports = SettingGeneral;
