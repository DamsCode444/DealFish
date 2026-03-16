import express, { Request, Response, NextFunction } from "express";
import { ENV } from "./config/env";
import cors from "cors";
import fs from "fs";
import { clerkMiddleware } from '@clerk/express';
import path from "path";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import cartRoutes from "./routes/cartRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import * as paymentController from "./controller/paymentController";
import orderRoutes from "./routes/orderRoutes";

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://dealfish.onrender.com",
      ENV.FRONTEND_URL
    ].filter(Boolean);
    
    // In production, allow any subdomain of onrender.com
    const isRenderSubdomain = origin && origin.endsWith(".onrender.com");

    if (!origin || allowedOrigins.includes(origin) || isRenderSubdomain) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Apply CORS globally (this attaches the CORS response headers)
app.use(cors(corsOptions));

// Webhook route needs raw body for Stripe signature verification
// Map both potential URLs for robustness
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), paymentController.handleWebhook);
app.post("/stripe-webhook", express.raw({ type: "application/json" }), paymentController.handleWebhook);

// Body parsers (skip for webhook)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/payment/webhook" || req.originalUrl === "/stripe-webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === "/api/payment/webhook" || req.originalUrl === "/stripe-webhook") {
      next();
    } else {
      express.urlencoded({ extended: true })(req, res, next);
    }
});

// Clerk middleware after CORS
app.use(clerkMiddleware());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to Productify API" });
});

app.use("/api/users", userRoutes);
// Alias both /api/product and /api/products for robustness
app.use("/api/product", productRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorLog = `[${new Date().toISOString()}] ERROR: ${err.message}\nStack: ${err.stack}\nURL: ${req.originalUrl}\n\n`;
  try {
    fs.appendFileSync(path.join(process.cwd(), "errors.log"), errorLog);
  } catch (e) {
    console.error("Failed to write to error log:", e);
  }

  console.error("[Global Error Handler]:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: ENV.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Serve frontend in production
const nodeEnv = ENV.NODE_ENV || process.env.NODE_ENV || "development";
if (nodeEnv === "production") {
  const frontendDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendDistPath));
  // Fallback to index.html for SPA routing (must be after static middleware)
  app.use((req: Request, res: Response) => {
    // Don't serve index.html for API routes — let them 404 with JSON
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ success: false, message: "API endpoint not found" });
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(ENV.PORT, () => console.log("Server is running on port " + ENV.PORT));