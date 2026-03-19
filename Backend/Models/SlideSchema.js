import mongoose from "mongoose";

const SlideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // Cloudinary URL
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Slide = mongoose.models.Slide || mongoose.model("Slide", SlideSchema);
export default Slide;
