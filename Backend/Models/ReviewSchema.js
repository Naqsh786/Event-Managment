import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: false // Optional, only if target is 'event'
    },
    target: {
        type: String,
        enum: ["web", "event"],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    isAdminRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;
