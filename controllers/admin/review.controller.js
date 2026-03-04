const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const reviewService = require("../../services/review.service");
const createLog = require("../../helpers/activityLog");

// [GET] /admin/reviews
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.userName = objectSearch.regex;
        }

        // Filter by rating
        if (req.query.rating) {
            find.rating = parseInt(req.query.rating);
        }

        // Pagination
        const totalItems = await Review.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        const reviews = await Review.find(find)
            .sort({ createdAt: -1 })
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        // Lấy tên sản phẩm cho mỗi review
        const productIds = [...new Set(reviews.map(r => r.productId))];
        const products = await Product.find({ _id: { $in: productIds } }).select("title slug");
        const productMap = {};
        products.forEach(p => {
            productMap[p._id.toString()] = p;
        });

        res.render("admin/pages/reviews/index", {
            pageTitle: "Quản lý đánh giá",
            currentPage: "reviews",
            breadcrumbs: [
                { title: "Đánh giá sản phẩm" }
            ],
            reviews: reviews,
            productMap: productMap,
            keyword: objectSearch.keyword,
            pagination: objectPagination,
            selectedRating: req.query.rating || ""
        });
    } catch (error) {
        console.log("Admin reviews error:", error);
        res.redirect("back");
    }
};

// [DELETE] /admin/reviews/delete/:id
module.exports.deleteReview = async (req, res) => {
    try {
        const { modified } = await reviewService.softDelete(req.params.id);

        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "reviews",
                description: `Xóa đánh giá/bình luận (ID: ${req.params.id})`
            });
            res.json({ code: 200, message: "Xoá đánh giá thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log("Delete review error:", error);
        res.json({ code: 500, message: "Có lỗi xảy ra!" });
    }
};

// [PATCH] /admin/reviews/reply/:id
module.exports.replyPatch = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { content } = req.body;
        const adminUser = res.locals.user;

        if (!content || !content.trim()) {
            return res.json({ code: 400, message: "Nội dung phản hồi không được để trống!" });
        }

        const replyData = {
            adminId: adminUser.id,
            adminFullName: adminUser.fullName,
            content: content.trim()
        };

        await reviewService.addReply(reviewId, replyData);

        createLog(req, res, {
            action: "reply",
            module: "reviews",
            description: `Phản hồi đánh giá (ID: ${reviewId})`
        });

        res.json({ 
            code: 200, 
            message: "Gửi phản hồi thành công!",
            reply: replyData
        });
    } catch (error) {
        console.log("Reply review error:", error);
        res.json({ code: 500, message: "Có lỗi xảy ra khi phản hồi!" });
    }
};
