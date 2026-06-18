const SettingSeo = require("../../models/setting-seo.model");

// [GET] /robots.txt
module.exports.index = async (req, res) => {
    try {
        const settingSeo = await SettingSeo.findOne({});
        
        let robotsContent = "User-agent: *\nAllow: /\nSitemap: http://localhost:3000/sitemap.xml";

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
