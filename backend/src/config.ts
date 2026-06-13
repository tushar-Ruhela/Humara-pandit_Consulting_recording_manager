import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store uploaded files directly in Cloudinary under the "consultations" folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'consultations',
    resource_type: 'auto', // accepts audio, video, and other file types
  } as any,
});

// Multer middleware — handles multipart/form-data file uploads
export const upload = multer({ storage });
