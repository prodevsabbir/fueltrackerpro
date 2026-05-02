import express, { NextFunction, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/server";
import routes from "./routes/index.api";
import { globalErrorHandler } from "./helpers/globalErrorHandler";
import { serverRunningTemplate } from "./tempaletes/serverlive.template";
import config from "./config";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import CustomError from "./helpers/CustomError";
import { notFound } from "./middleware/notFound";
import { googleLogin, kakaoLoginPage } from "./Oauth/google";
// import { StripeWebhook } from "./modules/subscription/subscription.controller";
// import passport from "./Oauth/passport/kakao"; // not use a midlleware

const app = express();
const server = http.createServer(app);

if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("short"));
}

// Disable ETag to prevent 304 Not Modified caching issues which strip CORS headers
app.set("etag", false);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const staticAllowed = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        config.frontendUrl,
        "https://fuel-tracker-kappa.vercel.app",
      ];
      const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
      if (staticAllowed.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Force strict CORS headers as a fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const staticAllowed = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    config.frontendUrl,
    "https://fuel-tracker-kappa.vercel.app",
  ];
  const isVercelPreview =
    typeof origin === "string" &&
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

  if (origin && (staticAllowed.includes(origin) || isVercelPreview)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", config.frontendUrl);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// app.post(
//   "/api/v1/payment/webhook",
//   express.raw({ type: "application/json" }),
//   StripeWebhook,
// );
app.get("/api/v1/ping", (req, res) => {
  res.json({
    success: true,
    message: "Server is alive",
    time: new Date(),
  });
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(passport.initialize())

app.use("/api/v1", routes);

app.get("/google-test", googleLogin);
app.get("/kakao-test", kakaoLoginPage);

app.get("/", serverRunningTemplate);
app.use(notFound);

//global error handler
app.use(globalErrorHandler);

// Socket.IO setup
const io = initSocket(server);
export { io, server };
