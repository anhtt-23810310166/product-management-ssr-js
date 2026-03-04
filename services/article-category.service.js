const BaseService = require("./base.service");
const ArticleCategory = require("../models/article-category.model");

class ArticleCategoryService extends BaseService {
    constructor() {
        super(ArticleCategory, "article-category", { searchField: "title", nameField: "title" });
    }

    /**
     * Tạo danh mục bài viết
     */
    async create(data, file) {
        if (file) {
            data.thumbnail = file.path;
        }

        data.position = await this.autoPosition(data.position);

        const category = new this.Model(data);
        await category.save();
        return category;
    }

    /**
     * Cập nhật danh mục bài viết
     */
    async update(id, data, file) {
        const category = await this.Model.findById(id);
        if (!category) throw new Error("NOT_FOUND");

        if (file) {
            data.thumbnail = file.path;
        }

        if (data.position) {
            data.position = parseInt(data.position);
        }

        // Cập nhật các trường
        category.title = data.title;
        category.parent_id = data.parent_id || "";
        category.description = data.description;
        category.status = data.status;
        category.position = data.position;
        if (data.thumbnail) category.thumbnail = data.thumbnail;

        await category.save();
        return category;
    }
}

module.exports = new ArticleCategoryService();
