const mongoose = require("mongoose");

const settingSeoSchema = new mongoose.Schema(
    {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: String,
        ogImage: String,
        googleAnalyticsId: String,
        robotsTxt: String
    },
    {
        timestamps: true
    }
);

const SettingSeo = mongoose.model(
    "SettingSeo",
    settingSeoSchema,
    "settings-seo"
);

module.exports = SettingSeo;
