
import jwt from "jsonwebtoken";
import User from "../Models/UserSchema.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    console.log("JWT_SECRET used for verification:", process.env.JWT_SECRET);
    console.log("Token being verified:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({
      success: false,
      message: "Token invalid",
      debug: error.message
    });
  }
};
