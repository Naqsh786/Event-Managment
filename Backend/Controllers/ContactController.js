import Contact from "../Models/ContactSchema.js";
import { io } from "../socket.js";

/* =========================
   SEND MESSAGE (PUBLIC)
========================= */
export const sendMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, email, phone, message)",
            });
        }

        const newMessage = new Contact({ name, email, phone, message });
        await newMessage.save();

        // Notify admins about new message for badge update
        io.emit("new_contact_message");

        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: newMessage,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* =========================
   GET ALL MESSAGES (ADMIN)
========================= */
export const getAllMessages = async (req, res) => {
    try {
        // Show only pending messages to the admin if requested by "hat jaye"
        const messages = await Contact.find({ status: "pending" }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* =========================
   UPDATE MESSAGE STATUS (ADMIN)
========================= */
export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status provided",
            });
        }

        const message = await Contact.findByIdAndUpdate(id, { status, userRead: false }, { new: true });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        // Notify the user about status change for badge update
        io.to(message.email).emit("notification_update");

        res.status(200).json({
            success: true,
            message: `Message ${status} successfully`,
            data: message,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* =========================
   GET USER NOTIFICATIONS (USER)
========================= */
export const getUserNotifications = async (req, res) => {
    try {
        const { email } = req.params;
        // Fetch all messages (pending, approved, rejected) for this user to show history/status
        const notifications = await Contact.find({ email }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* =========================
   UNREAD COUNTS & MARK READ
========================= */

// Admin unread contact messages
export const getAdminUnreadCount = async (req, res) => {
    try {
        const count = await Contact.countDocuments({ adminRead: false });
        res.status(200).json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// User unread notifications (approved/rejected updates)
export const getUserUnreadCount = async (req, res) => {
    try {
        const { email } = req.params;
        const count = await Contact.countDocuments({ email, userRead: false, status: { $ne: "pending" } });
        res.status(200).json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const markAdminRead = async (req, res) => {
    try {
        await Contact.updateMany({ adminRead: false }, { adminRead: true });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const markUserRead = async (req, res) => {
    try {
        const { email } = req.params;
        await Contact.updateMany({ email, userRead: false }, { userRead: true });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
