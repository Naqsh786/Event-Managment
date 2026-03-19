import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    details: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const AdminLog = mongoose.models.AdminLog || mongoose.model("AdminLog", AdminLogSchema);
export default AdminLog;
