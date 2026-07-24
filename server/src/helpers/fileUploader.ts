import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import config from '../config';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), '/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

async function uploadToCloudinary(file: Express.Multer.File) {
  // Configuration
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  });

  // Upload an image/audio/video
  const uploadResult = await cloudinary.uploader
    .upload(file.path, {
      public_id: `${file.originalname}-${Date.now()}`,
      resource_type: 'auto',
    })
    .catch((error) => {
      throw error;
    });

  // ডিলিট করার কোড ঠিক থাকবে
  fs.unlinkSync(file.path);

  // Cloudinary থেকে Optimize করা URL তৈরি করা (ফাইল টাইপ অনুযায়ী)
  const optimizeUrl = cloudinary.url(uploadResult.public_id, {
    fetch_format: 'auto',
    quality: 'auto',
    secure: true, // https এর জন্য
    resource_type: uploadResult.resource_type, // "image", "video", or "raw"
  });

  // অরিজিনাল secure_url এর বদলে optimizeUrl দিয়ে রিপ্লেস করে দেওয়া হলো
  uploadResult.secure_url = optimizeUrl;

  return uploadResult;
}

// 🛡️ SECURITY: File Upload Validation
// ==========================================
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'audio/webm',
  'audio/mp3',
  'audio/ogg',
  'audio/mpeg',
  'video/webm',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.webm', '.mp3', '.ogg'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // Maximum 5 MB limit
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // ১. ফাইলের আসল ধরন (MIME Type) চেক করা
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only images, PDFs, and Audio are allowed.'));
  }
  // ২. ফাইলের এক্সটেনশন চেক করা (যাতে কেউ .exe ফাইল আপলোড না করতে পারে)
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file extension!'));
  }
  cb(null, true); // সব ঠিক থাকলে আপলোড করতে দাও
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // ৫0 এমবির বেশি হলে আটকে দিবে
  },
});

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
