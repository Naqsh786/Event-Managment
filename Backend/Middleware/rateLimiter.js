import rateLimit from "express-rate-limit";

// Limiter for sensitivity routes (Login, Register)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 20, 
    message: {
        success: false,
        message: "Too many attempts from this IP, please try again after 15 minutes"
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// Global limiter for all API hits
export const globalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per minute
    message: {
        success: false,
        message: "You are hitting the API too fast. Relax a bit!"
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

