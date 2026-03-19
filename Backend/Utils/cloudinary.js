import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.Cloudinary_name,
    api_key: process.env.Cloudinary_key,
    api_secret: process.env.Cloudinary_secret,
});

export const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "mern_avatars"
        });

        // File has been uploaded successfully
        // Remove the local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response.secure_url;
    } catch (error) {
        // Do NOT remove the local file if upload failed - we will use it as a fallback
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

export default cloudinary;
