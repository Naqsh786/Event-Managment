import Review from "../Models/ReviewSchema.js";
import Event from "../Models/EventSchema.js";
import mongoose from "mongoose";

// Add a new review
export const addReview = async (req, res) => {
    try {
        const { target, eventId, rating, comment } = req.body;
        const userId = req.user._id;

        if (!target || !rating || !comment) {
            return res.status(400).json({ message: "Rating and comment are required." });
        }

        const newReview = new Review({
            user: userId,
            event: target === "event" ? eventId : null,
            target,
            rating,
            comment
        });

        await newReview.save();

        // Populate user details before returning
        const populatedReview = await Review.findById(newReview._id).populate("user", "name profileImage");

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews (all for admin, or filtered by event/web)
export const getReviews = async (req, res) => {
    try {
        const { target, eventId } = req.query;
        let query = {};

        if (target) query.target = target;
        if (eventId) query.event = eventId;

        const reviews = await Review.find(query)
            .populate("user", "name profileImage")
            .populate("event", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a review (Admin or Owner)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check permission (Admin or the user who wrote it)
        if (req.user.role !== "Admin" && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(id);
        res.status(200).json({ message: "Review removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Average Rating for an event
export const getAverageRating = async (req, res) => {
    try {
        const { eventId } = req.params;
        const stats = await Review.aggregate([
            { $match: { event: new mongoose.Types.ObjectId(eventId) } },
            { $group: { _id: "$event", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ]);

        res.status(200).json(stats[0] || { averageRating: 0, totalReviews: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread reviews count for admin
export const getUnreadReviewCount = async (req, res) => {
    try {
        const count = await Review.countDocuments({ isAdminRead: false });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark reviews as read for admin
export const markReviewsAsRead = async (req, res) => {
    try {
        await Review.updateMany({ isAdminRead: false }, { $set: { isAdminRead: true } });
        res.status(200).json({ message: "Reviews marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
