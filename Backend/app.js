import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './DB.js';

// Load Env
dotenv.config();

import UserRouter from './Routes/UserRouter.js';
import ContactRouter from './Routes/ContactRouter.js';
import AdminRouter from './Routes/AdminRouter.js';
import CategoryRouter from './Routes/CategoryRouter.js';
import SlideRouter from './Routes/SlideRouter.js';
import EventRouter from './Routes/EventRouter.js';
import ChatRouter from './Routes/ChatRouter.js';
import ReviewRouter from './Routes/ReviewRouter.js';

import { globalRateLimiter } from './Middleware/rateLimiter.js';

// Initialize Express App
const app = express();

// Trust proxy for rate limiting (essential for Vercel/Heroku)
app.set('trust proxy', 1);

app.use(helmet());

// Apply Global Rate Limiting to all requests
app.use(globalRateLimiter);

// Top-level connection for environments that support it
try {
    await connectDB();
} catch (err) {
    console.error("Top-level DB connection failed:", err.message);
}

// Middleware to ensure DB is connected for every request (especially Vercel cold starts)
app.use(async (req, res, next) => {
    try {
        console.log(`[Request] ${req.method} ${req.originalUrl}`);
        // Ensure DATABASE exists
        if (!process.env.DATABASE) {
            console.error("FATAL: DATABASE environment variable is missing!");
            return res.status(500).json({ success: false, message: "Database config missing" });
        }

        await connectDB();
        console.log("Database connection ready for request");
        next();
    } catch (err) {
        console.error("Critical Database Connection Error in Middleware:", {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            success: false,
            message: "Internal Server Error: Database initialization failed",
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  "https://event-managment-b.vercel.app/", // Backend itself
  // Add your frontend vercel URL and IP here
  process.env.FRONTEND_URL,
  process.env.ALLOWED_IP
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || origin.includes("vercel.app") || origin.includes("localhost");
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`[CORS] Rejected Origin: ${origin}`);
      // Don't throw a hard error, just reject it
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json())

// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Majestic Events Backend API is running",
        version: "1.0.0"
    });
});

app.use("/user", UserRouter)
app.use("/admin", AdminRouter)
app.use("/category", CategoryRouter)
app.use("/event", EventRouter)
app.use("/slide", SlideRouter)
app.use("/contact", ContactRouter)
app.use("/chat", ChatRouter)
app.use("/review", ReviewRouter)
app.use('/uploads', express.static('uploads'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Caught:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: err.toString(),
        stack: err.stack // Always show for now to debug Vercel
    });
});


export default app;