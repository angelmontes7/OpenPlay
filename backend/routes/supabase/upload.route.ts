import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for uploads
);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileExt = path.extname(file.originalname);
    const filePath = `public/profile-${randomUUID()}${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("profile-pics")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return res.status(500).json({ error: "Upload to Supabase failed" });
    }

    // Get public URL
    const { data: publicURLData } = supabase.storage
      .from("profile-pics")
      .getPublicUrl(filePath);

    return res.status(200).json({ url: publicURLData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
