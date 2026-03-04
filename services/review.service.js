const BaseService = require("./base.service");
const Review = require("../models/review.model");

class ReviewService extends BaseService {
    constructor() {
        super(Review, "reviews", { searchField: "userName" });
    }

    async addReply(reviewId, replyData) {
        await Review.updateOne(
            { _id: reviewId },
            { $push: { replies: replyData } }
        );
        return { success: true };
    }
}

module.exports = new ReviewService();
