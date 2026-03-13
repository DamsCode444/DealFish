import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../config/env";
import { getAuth } from "@clerk/express";

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

router.post("/", upload.array("images", 5), async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadPromises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "productify" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({ success: true, message: "Images uploaded successfully", data: imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ success: false, message: "Error uploading images" });
  }
});

export default router;
