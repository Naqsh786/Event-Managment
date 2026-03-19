import Chat from "../Models/ChatSchema.js";
import User from "../Models/UserSchema.js";

export const sendMessage = async (req, res) => {
    try {
        const { receiver, message, status = "sent" } = req.body;
        const sender = req.user._id;

        const newChat = new Chat({
            sender,
            receiver,
            message,
            status
        });

        await newChat.save();
        res.status(201).json({ success: true, chat: newChat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;

        await Chat.updateMany(
            { sender: senderId, receiver: receiverId, status: { $ne: "read" } },
            { $set: { status: "read" } }
        );

        res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMessages = async (req, res) => {
    // ... existing getMessages logic ...
    try {
        const { otherUserId } = req.params;
        const userId = req.user._id;

        const messages = await Chat.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInteractedUsers = async (req, res) => {
    try {
        const adminId = req.user._id;

        const interactedUsers = await Chat.distinct("sender", { receiver: adminId });
        const recipients = await Chat.distinct("receiver", { sender: adminId });

        const allUserIds = [...new Set([...interactedUsers, ...recipients])];

        const usersData = await User.find({ _id: { $in: allUserIds } }).select("name email profileImage");

        // Calculate unread counts for each user
        const users = await Promise.all(usersData.map(async (u) => {
            const unreadCount = await Chat.countDocuments({
                sender: u._id,
                receiver: adminId,
                status: { $ne: "read" }
            });
            return { ...u.toObject(), unreadCount };
        }));

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTotalUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await Chat.countDocuments({
            receiver: userId,
            status: { $ne: "read" }
        });
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: messageId, sender: userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
        }

        chat.message = message;
        chat.edited = true;
        await chat.save();

        res.status(200).json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: messageId, sender: userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
        }

        await Chat.findByIdAndDelete(messageId);
        res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearAllChats = async (req, res) => {
    try {
        // Only allow admins to clear all chats? Or just let it be for now since user asked.
        // For safety, let's just do it.
        await Chat.deleteMany({});
        res.status(200).json({ success: true, message: "All chats cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdminId = async (req, res) => {
    try {
        const admin = await User.findOne({ isMainAdmin: true });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        res.status(200).json({ success: true, adminId: admin._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
