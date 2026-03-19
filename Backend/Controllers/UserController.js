import User from "../Models/UserSchema.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../Utils/generateToken.js";
import { sendEmail } from "../Utils/SendMailer.js";
import { uploadToCloudinary } from "../Utils/cloudinary.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, cpassword, phone, role, googleId } = req.body;

    if (!name || !email || !password || !cpassword || !phone || !role) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (password !== cpassword) {
      return res.status(400).json({ success: false, message: "Passwords not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.verifyuser) {
        return res.status(400).json({ success: false, message: "User already exists. Please login." });
      } else {
        return res.status(400).json({ success: false, message: "Email registered but not verified. Please verify your email or resend OTP." });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    // FIRST ADMIN LOGIC: If role is Admin, check if any other approved admin exists
    const adminExists = await User.findOne({ role: "Admin", isMainAdmin: true });

    if (role === "Admin" && adminExists) {
      return res.status(403).json({
        success: false,
        message: "Admin registration is restricted. A main admin already exists."
      });
    }

    // Force role to be either 'Admin' or 'user'
    const finalRole = (role === "Admin") ? "Admin" : "user";

    let autoApprove = false;
    if (role === "Admin" && !adminExists) {
      autoApprove = true;
    }

    // Upload to Cloudinary if file exists
    let profileImageUrl = "";
    if (req.file) {
      const cloudinaryUrl = await uploadToCloudinary(req.file.path);
      if (cloudinaryUrl) {
        profileImageUrl = cloudinaryUrl;
      } else {
        console.error("Cloudinary upload failed, profile image not set.");
      }
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    const usr = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: finalRole,
      verifyuser: false,
      verifycode: code,
      verifycodeexp: expiry,
      profileImage: profileImageUrl, // Save Cloudinary URL
      isAdminApproved: autoApprove,
      isMainAdmin: autoApprove,
      googleId: googleId || null,
    });


    console.log("\n========================");
    console.log(`🔑 YOUR CODE IS: ${code}`);
    console.log("==========================\n");

    // Send Email
    const emailSubject = finalRole === "Admin" ? "Majestic Admin Verification" : "Majestic User Verification";
    await sendEmail(email, emailSubject, `Welcome to Majestic Events! Your account verification code is: ${code}`);

    res.json({
      success: true,
      message: "Registered successfully. Verification code sent to email.",
      data: usr
    });

  } catch (err) {
    console.error("Critical Register User Error:", {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // Duplicate Key
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Validation Error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: "Validation failed", details: err.message });
    }

    res.status(500).json({
      success: false,
      message: "An internal error occurred during registration. Please check server logs.",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/* ================= VERIFY ================= */
export const verifyUser = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verifyuser) {
      return res.status(400).json({ success: false, message: "User already verified" });
    }

    // IF CODE IS PROVIDED: VERIFY IT
    if (code) {
      if (user.verifycode !== code) {
        return res.status(400).json({ success: false, message: "Invalid code" });
      }
      if (user.verifycodeexp < Date.now()) {
        return res.status(400).json({ success: false, message: "Code expired" });
      }

      // Success: Mark verified
      user.verifyuser = true;
      user.verifycode = null;
      user.verifycodeexp = null;
      await user.save();

      return res.json({
        success: true,
        message: "Account Verified Successfully",
        user: {
          email: user.email,
          role: user.role
        }
      });
    }


    return res.status(400).json({ success: false, message: "Verification code is required" });
  } catch (err) {
    console.error("Verify User Error:", err);
    res.status(500).json({ success: false, message: "Error verifying account", error: err.message });
  }
};

/* ================= RESEND OTP ================= */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verifyuser) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    // Generate NEW OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    user.verifycode = code;
    user.verifycodeexp = expiry;
    await user.save();

    console.log("\n==========================================");
    console.log(`🔄 ${user.role.toUpperCase()} RESEND OTP VERIFICATION CODE FOR ${user.name.toUpperCase()}: ${code}`);
    console.log("==========================================\n");

    // Send Email
    const emailSubject = `${user.role === "Admin" ? "Admin" : "User"} Resend Verification`;
    await sendEmail(email, emailSubject, `Hello ${user.name}, your new Majestic Events verification code is: ${code}`);

    res.json({
      success: true,
      message: "New verification code sent to your email."
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ success: false, message: "Error resending OTP" });
  }
};

/* ================= LOGIN ================= */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user and ensure account is verified
    const user = await User.findOne({ email, verifyuser: true });
    if (!user) {
      return res.status(403).json({ success: false, message: "User not found or not verified" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Admin has deactivated your account." });
    }

    // Check if Admin is approved
    if (user.role === "Admin" && !user.isAdminApproved) {
      return res.status(403).json({ success: false, message: "Your Admin account is pending approval. Please wait for the main admin to approve your request." });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return response without password
    const { password: pwd, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
};

/* ================= GOOGLE LOGIN ================= */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    let googleData;
    try {
      // 1. Try to verify as an ID Token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      googleData = ticket.getPayload();
    } catch (err) {
      // 2. If it fails, treat it as an Access Token and fetch user info
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        googleData = await response.json();
        
        if (!googleData || !googleData.email) {
          throw new Error("Invalid Access Token");
        }
      } catch (axiosErr) {
        return res.status(401).json({ success: false, message: "Invalid Google Token" });
      }
    }

    const { sub, id, email, name, picture } = googleData;
    const googleId = sub || id;

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId, link it
      if (!user.googleId) {
        user.googleId = googleId;
        // If they already have a picture but were verifying via email, we keep the previous one 
        // unless they don't have one.
        if (!user.profileImage) user.profileImage = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: picture,
        verifyuser: true, // Auto-verify Google users
        role: "user",
        isAdminApproved: false,
        isMainAdmin: false,
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Admin has deactivated your account." });
    }

    // Generate JWT
    const jwtToken = generateToken(user._id.toString());

    const { password: pwd, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Google Login successful",
      token: jwtToken,
      user: userData,
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(500).json({ success: false, message: `Google Login failed: ${err.message}` });
  }
};


/* ================= GET PROFILE ================= */
export const getUser = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ success: false, message: "Error fetching user profile" });
  }
};



/* ================= UPDATE PROFILE ================= */
export const updateUser = async (req, res) => {
  try {
    const { name, phone, role, isAdminApproved } = req.body;
    const { id } = req.params;

    // Standardize role if provided
    let finalRole = role;
    if (role && role !== "Admin") {
      finalRole = "user";
    }

    // Protect isMainAdmin from being changed via this endpoint
    let updateData = { name, phone, role: finalRole, isAdminApproved };

    // If a new file is uploaded, upload it to Cloudinary
    if (req.file) {
      const cloudinaryUrl = await uploadToCloudinary(req.file.path);
      if (cloudinaryUrl) {
        updateData.profileImage = cloudinaryUrl;
      } else {
        console.error("Cloudinary upload failed during update.");
      }
    }

    // CHECK IF ADMIN IS BEING APPROVED TO SEND NOTIFICATION
    const oldUser = await User.findById(id || req.user._id);
    if (oldUser && !oldUser.isAdminApproved && isAdminApproved === "true") {
      await sendEmail(oldUser.email, "Admin Account Approved", `Hello ${oldUser.name}, your Admin account has been approved. You can now login to your dashboard.`);
    }

    const user = await User.findByIdAndUpdate(
      id || req.user._id,
      updateData,
      { new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

/* ================= DELETE ACCOUNT ================= */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToDelete = await User.findById(id || req.user._id);

    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Restriction: Only Main Admin can delete other Admins
    if (userToDelete.role === "Admin" && !req.user.isMainAdmin) {
      return res.status(403).json({ success: false, message: "Only the Main Admin can delete other Admin accounts" });
    }

    if (userToDelete.isMainAdmin) {
      return res.status(403).json({ success: false, message: "Main Admin cannot be deleted" });
    }

    await User.findByIdAndDelete(userToDelete._id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.forgotcode = code;
    user.forgotcodeexp = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("\n==========================================");
    console.log(`🔐 ${user.role.toUpperCase()} FORGOT PASSWORD RESET CODE FOR ${user.name.toUpperCase()}: ${code}`);
    console.log("==========================================\n");

    const emailSubject = `${user.role === "Admin" ? "Admin" : "User"} Password Reset`;
    await sendEmail(email, emailSubject, `Hello ${user.name}, your Majestic Events password reset code is: ${code}`);

    res.json({ success: true, message: "Reset code sent to email", data: user });
  } catch (err) {
    console.error("Forgot User Error:", err);
    res.status(500).json({ success: false, message: "Error sending reset code" });
  }
};

/* ================= VERIFY RESET CODE ================= */
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.forgotcode !== code || user.forgotcodeexp < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    res.json({ success: true, message: "Code verified successfully" });
  } catch (err) {
    console.error("Verify Reset Code Error:", err);
    res.status(500).json({ success: false, message: "Error verifying reset code" });
  }
};

/* ================= RESET PASSWORD (FORGOT) ================= */
export const resetUser = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.forgotcode !== code || user.forgotcodeexp < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.forgotcode = null;
    user.forgotcodeexp = null;
    await user.save();

    res.json({ success: true, message: "Password reset successful", data: user });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

/* ================= EDIT PASSWORD (LOGGED IN) ================= */
export const editPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Edit Password Error:", err);
    res.status(500).json({ success: false, message: "Error updating password" });
  }
};
