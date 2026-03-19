import User from "../Models/UserSchema.js";
import AdminLog from "../Models/AdminLogSchema.js";
import { sendEmail } from "../Utils/SendMailer.js";
import bcrypt from "bcryptjs";

/* ================= CHECK MAIN ADMIN EXISTS ================= */
export const checkMainAdmin = async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: "Admin", isMainAdmin: true });
        res.json({ success: true, exists: !!adminExists });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error checking admin status" });
    }
};

/* ================= GET ALL USERS (ADMIN DASHBOARD) ================= */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

/* ================= TOGGLE USER STATUS ================= */
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userToToggle = await User.findById(id);

        if (!userToToggle) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (userToToggle.isMainAdmin) {
            return res.status(403).json({ success: false, message: "Cannot deactivate Main Admin" });
        }

        // Toggle status
        userToToggle.isActive = !userToToggle.isActive;
        await userToToggle.save();

        // Log Action
        await AdminLog.create({
            adminId: req.user._id,
            action: userToToggle.isActive ? "ACTIVATED_USER" : "DEACTIVATED_USER",
            targetId: userToToggle._id,
            details: `User ${userToToggle.email} status changed to ${userToToggle.isActive ? 'Active' : 'Inactive'}`
        });

        const statusMsg = userToToggle.isActive ? "activated" : "deactivated";
        res.json({
            success: true,
            message: `User ${statusMsg} successfully`,
            user: userToToggle
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating user status" });
    }
};

/* ================= PROMOTE TO ADMIN ================= */
export const promoteToAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Security check: Only main admin can promote others
        if (!req.user.isMainAdmin) {
            return res.status(403).json({ success: false, message: "Access denied. Only the Main Admin can promote users." });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Role update
        user.role = "Admin";
        user.isAdminApproved = true;

        // Notification update
        user.notifications.push({
            message: "You are now an Admin. You can login to access the Admin Dashboard.",
            date: Date.now(),
            read: false
        });

        await user.save();

        // Log Action
        await AdminLog.create({
            adminId: req.user._id,
            action: "PROMOTED_USER",
            targetId: user._id,
            details: `User ${user.email} promoted to Admin`
        });

        res.json({
            success: true,
            message: "User promoted to Admin successfully. Notification sent.",
            user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error promoting user to admin" });
    }
};

/* ================= REJECT ADMIN ================= */
export const rejectAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Send the mandatory rejection email
        const rejectionMessage = "Your admin request was rejected by the main admin. Your account has been deleted.";
        await sendEmail(user.email, "Admin Request Rejected", rejectionMessage);

        // Delete the account
        await User.findByIdAndDelete(id);

        // Log Action
        await AdminLog.create({
            adminId: req.user._id,
            action: "REJECTED_ADMIN",
            targetId: id, // ID might not point to a user anymore since deleted, but good for record
            details: `Admin request for ${user.email} rejected and account deleted`
        });

        res.json({ success: true, message: "Admin request rejected and account deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error rejecting admin" });
    }
};

/* ================= RESTORE MAIN ADMIN (BACKUP) ================= */
export const restoreMainAdmin = async (req, res) => {
    try {
        const { secretKey, name, email, password, phone } = req.body;

        // Use an environment variable for the secret key in production
        if (secretKey !== "BACKUP_RESTORE_KEY_786") {
            return res.status(403).json({ success: false, message: "Invalid secret key" });
        }

        const adminExists = await User.findOne({ role: "Admin", isMainAdmin: true });
        if (adminExists) {
            return res.status(400).json({ success: false, message: "Main admin already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const usr = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role: "Admin",
            verifyuser: true,
            isAdminApproved: true,
            isMainAdmin: true,
        });

        res.json({ success: true, message: "Main Admin restored successfully", data: usr });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error restoring main admin" });
    }
};
