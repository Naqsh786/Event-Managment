import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: false, // Changed to false for Google login
        },

        phone: {
            type: String,
            required: false, // Changed to false for Google login
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true // Allows multiple null values for non-google users
        },

        role: {
            type: String,
            default: "user",
        },

        verifycode: {
            type: String,
        },

        verifyuser: {
            type: Boolean,
            default: false,
        },

        verifycodeexp: {
            type: Date,
        },

        verifypassword: {
            type: Boolean,
            default: false,
        },

        forgotcode: {
            type: String,
        },

        forgotcodeexp: {
            type: Date,
        },

        forgotpassword: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String,
            default: "" // Path to the image
        },
        isAdminApproved: {
            type: Boolean,
            default: false,
        },
        isMainAdmin: {
            type: Boolean,
            default: false,
        },
        notifications: [
            {
                message: String,
                date: { type: Date, default: Date.now },
                read: { type: Boolean, default: false }
            }
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;