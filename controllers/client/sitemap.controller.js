const Product = require("../../models/product.model");
const Article = require("../../models/article.model");
const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");

// [GET] /sitemap.xml
module.exports.index = async (req, res) => {
    try {
        const baseUrl = "http://localhost:3000"; // Trong thực tế sẽ lấy từ biến môi trường hoặc config

        // Lấy tất cả Sản phẩm đang hoạt động
        const products = await Product.find({
            status: "active",
            deleted: false
        }).select("slug updatedAt");

        // Lấy tất cả Danh mục Sản phẩm đang hoạt động
        const productCategories = await ProductCategory.find({
            status: "active",
            deleted: false
        }).select("slug updatedAt");

        // Lấy tất cả Bài viết đang hoạt động
        const articles = await Article.find({
            status: "active",
            deleted: false
        }).select("slug updatedAt");

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/products</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${baseUrl}/articles</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;

        // Render URL sản phẩm
        products.forEach(product => {
            xml += `
    <url>
        <loc>${baseUrl}/products/detail/${product.slug}</loc>
        <lastmod>${product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        // Render URL danh mục
        productCategories.forEach(category => {
            xml += `
    <url>
        <loc>${baseUrl}/products/${category.slug}</loc>
        <lastmod>${category.updatedAt ? category.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        // Render URL bài viết
        articles.forEach(article => {
            xml += `
    <url>
        <loc>${baseUrl}/articles/detail/${article.slug}</loc>
        <lastmod>${article.updatedAt ? article.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;
        });

        xml += `\n</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(xml);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
};
