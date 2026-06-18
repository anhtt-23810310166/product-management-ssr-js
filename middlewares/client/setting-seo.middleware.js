const SettingSeo = require("../../models/setting-seo.model");

module.exports.settingSeo = async (req, res, next) => {
    const settingSeo = await SettingSeo.findOne({});

    if (settingSeo) {
        res.locals.settingSeo = settingSeo;
    }

    next();
};
