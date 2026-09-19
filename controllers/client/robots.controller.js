const SettingSeo = require("../../models/setting-seo.model");

// [GET] /robots.txt
module.exports.index = async (req, res) => {
    try {
        const settingSeo = await SettingSeo.findOne({});
        
        const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
        let robotsContent = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;

        if (settingSeo && settingSeo.robotsTxt) {
            robotsContent = settingSeo.robotsTxt;
        }

        res.type('text/plain');
        res.send(robotsContent);
    } catch (error) {
        res.type('text/plain');
        res.send("User-agent: *\nAllow: /");
    }
};
