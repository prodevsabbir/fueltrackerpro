import rateLimit from "express-rate-limit";

export const rateLimiter = (
    windowMinutes: number,
    maxRequests: number,
    message?: string
) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message: message || `Too many requests. Please try again after ${windowMinutes} minutes.`,
            });
        },
    });
};

/**
 * Specific limiters for sensitive routes
 */
export const authLimiter = rateLimiter(15, 10, "Too many login/registration attempts. Please try again after 15 minutes.");
export const otpLimiter = rateLimiter(30, 5, "Too many OTP requests. Please try again after 30 minutes.");
export const resetPasswordLimiter = rateLimiter(60, 3, "Too many password reset attempts. Please try again after an hour.");
