import express from "express";
import { addReview, getReviews, deleteReview, getAverageRating, getUnreadReviewCount, markReviewsAsRead } from "../Controllers/ReviewController.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/add", protect, addReview);
router.get("/all", getReviews);
router.get("/unread-count", protect, getUnreadReviewCount);
router.put("/mark-read", protect, markReviewsAsRead);
router.get("/avg/:eventId", getAverageRating);
router.delete("/delete/:id", protect, deleteReview);

export default router;
