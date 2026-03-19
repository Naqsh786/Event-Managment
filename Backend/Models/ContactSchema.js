import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminRead: {
            type: Boolean,
            default: false,
        },
        userRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export default Contact;
