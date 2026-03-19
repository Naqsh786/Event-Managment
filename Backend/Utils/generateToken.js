import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({quiet:true});

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "default_fallback_secret_change_me",
    { expiresIn: "7d" }
  );
};
