import express from "express";
import {
    checkMainAdmin,
    getAllUsers,
    promoteToAdmin,
    rejectAdmin,
    restoreMainAdmin,
    toggleUserStatus
} from "../Controllers/AdminController.js";
import { protect } from "../Middleware/auth.js";
import upload from "../Middleware/upload.js"; // Kept if needed for future admin uploads, though not strictly used in current routes

const AdminRouter = express.Router();

// Public Admin Routes (Setup/Recovery)
AdminRouter.get("/check-main-admin", checkMainAdmin);
AdminRouter.post("/restore-main-admin", restoreMainAdmin);

// Protected Admin Dashboard Routes
AdminRouter.get("/getall", protect, getAllUsers);
AdminRouter.put("/promote-to-admin/:id", protect, promoteToAdmin);
AdminRouter.put("/toggle-status/:id", protect, toggleUserStatus);
AdminRouter.delete("/reject-admin/:id", protect, rejectAdmin);

export default AdminRouter;
