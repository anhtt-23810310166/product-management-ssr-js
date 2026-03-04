const BaseService = require("./base.service");
const Article = require("../models/article.model");

class ArticleService extends BaseService {
    constructor() {
        super(Article, "articles", { searchField: "title", nameField: "title" });
    }

    /**
     * Tạo bài viết mới
     */
    async create(data, file) {
        if (file) {
            data.thumbnail = file.path;
        }

        data.position = await this.autoPosition(data.position);

        const article = new this.Model(data);
        await article.save();
        return article;
    }

    /**
     * Cập nhật bài viết
     */
    async update(id, data, file) {
        const article = await this.Model.findById(id);
        if (!article) throw new Error("NOT_FOUND");

        if (file) {
            data.thumbnail = file.path;
        }

        if (data.position) {
            data.position = parseInt(data.position);
        }

        // Cập nhật các trường
        article.title = data.title;
        article.article_category_id = data.article_category_id || "";
        article.content = data.content;
        article.shortDescription = data.shortDescription;
        article.status = data.status;
        article.position = data.position;
        if (data.thumbnail) article.thumbnail = data.thumbnail;

        await article.save();
        return article;
    }
}

module.exports = new ArticleService();
