import express from "express";
import { sendMessage, getMessages, getInteractedUsers, getAdminId, markAsRead, updateMessage, deleteMessage, clearAllChats, getTotalUnreadCount } from "../Controllers/ChatController.js";
import { protect } from "../Middleware/auth.js"; // Use lowercase 'auth.js' as per list_dir

const router = express.Router();
 
router.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Chat API is operational" });
});

router.get("/admin-id", protect, getAdminId);
router.post("/send", protect, sendMessage);
router.get("/history/:otherUserId", protect, getMessages);
router.get("/interacted", protect, getInteractedUsers);
router.put("/mark-read/:senderId", protect, markAsRead);
router.put("/update/:messageId", protect, updateMessage);
router.delete("/delete/:messageId", protect, deleteMessage);
router.delete("/clear-all", protect, clearAllChats);
router.get("/unread-count", protect, getTotalUnreadCount);

export default router;
