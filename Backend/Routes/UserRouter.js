import express from "express";
import { deleteUser, editPassword, forgotUser, getUser, loginUser, registerUser, resetUser, updateUser, verifyUser, verifyResetCode, resendOtp, googleLogin } from "../Controllers/UserController.js";
import { protect } from "../Middleware/auth.js";
import upload from "../Middleware/upload.js";
import { authRateLimiter } from "../Middleware/rateLimiter.js";


const UserRouter = express.Router();


UserRouter.post("/register", authRateLimiter, upload.single('profileImage'), registerUser);
UserRouter.post("/verify", verifyUser);
UserRouter.post("/resendotp", resendOtp);
UserRouter.post("/login", authRateLimiter, loginUser);
UserRouter.post("/google-login", authRateLimiter, googleLogin);

UserRouter.get("/get", protect, getUser);
UserRouter.put("/update/:id", protect, upload.single('profileImage'), updateUser);
UserRouter.delete("/delete/:id", protect, deleteUser);
UserRouter.put("/editpassword", protect, editPassword);

UserRouter.post("/forgot", forgotUser);
UserRouter.post("/verifycode", verifyResetCode);
UserRouter.post("/reset", resetUser);




export default UserRouter;