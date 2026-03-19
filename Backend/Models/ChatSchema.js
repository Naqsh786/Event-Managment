import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },
    edited: {
        type: Boolean,
        default: false
    }
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
export default Chat;
