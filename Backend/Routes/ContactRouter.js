import express from "express";
import { sendMessage, getAllMessages, updateMessageStatus, getUserNotifications, getAdminUnreadCount, getUserUnreadCount, markAdminRead, markUserRead } from "../Controllers/ContactController.js";

const router = express.Router();

// Public route to send a message
router.post("/send", sendMessage);

// Admin route to get all messages
router.get("/getall", getAllMessages);

// Admin route to approve/reject messages
router.put("/update-status/:id", updateMessageStatus);

// User route to get notifications by email
router.get("/user-notifications/:email", getUserNotifications);

// Unread counts and mark read
router.get("/unread-count", getAdminUnreadCount);
router.get("/user-unread-count/:email", getUserUnreadCount);
router.put("/mark-admin-read", markAdminRead);
router.put("/mark-user-read/:email", markUserRead);

export default router;
