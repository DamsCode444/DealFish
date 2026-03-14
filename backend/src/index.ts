import express, { Request, Response, NextFunction } from "express";
import { ENV } from "./config/env";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import path from "path";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://dealfish.onrender.com",
      ENV.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Apply CORS globally (this attaches the CORS response headers)
app.use(cors(corsOptions));

// Optional: explicitly handle preflight after cors middleware so headers are present
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    // cors() already added the required headers, so respond
    return res.sendStatus(204);
  }
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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