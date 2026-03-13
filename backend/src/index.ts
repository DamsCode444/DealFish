import express, { Request, Response, NextFunction } from "express";
import { ENV } from "./config/env";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import path from "path";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";

const app = express();

const corsOptions = {
  origin: ENV.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

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
app.use("/api/product", productRoutes);
app.use("/api/comments", commentRoutes);

// Serve frontend in production
const nodeEnv = ENV.NODE_ENV || process.env.NODE_ENV || "development";
if (nodeEnv === "production") {
  const frontendDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendDistPath));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(ENV.PORT, () => console.log("Server is running on port " + ENV.PORT));