import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    people: {
        type: Number,
        required: true,
        enum: [100, 200, 300, 400, 500, 600] // Constrain to specific values as requested
    },
    place: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
export default Event;
