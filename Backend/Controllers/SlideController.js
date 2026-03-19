import Slide from "../Models/SlideSchema.js";
import { uploadToCloudinary } from "../Utils/cloudinary.js";

/* ================= ADD SLIDE ================= */
export const addSlide = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: "Title and description are required" });
        }

        let imageUrl = "";
        if (req.file) {
            const cloudinaryUrl = await uploadToCloudinary(req.file.path);
            if (cloudinaryUrl) {
                imageUrl = cloudinaryUrl;
            } else {
                return res.status(500).json({ success: false, message: "Image upload failed on Cloudinary" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Slide image is required" });
        }

        const newSlide = await Slide.create({
            title,
            description,
            image: imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Slide added successfully",
            slide: newSlide
        });

    } catch (err) {
        console.error("Add Slide Controller Error:", err);
        res.status(500).json({
            success: false,
            message: "Error adding slide",
            error: err.message
        });
    }
};

/* ================= GET ALL SLIDES ================= */
export const getAllSlides = async (req, res) => {
    try {
        const slides = await Slide.find().sort({ createdAt: -1 });
        res.json({ success: true, data: slides });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching slides" });
    }
};

/* ================= DELETE SLIDE ================= */
export const deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await Slide.findByIdAndDelete(id);

        if (!slide) {
            return res.status(404).json({ success: false, message: "Slide not found" });
        }

        res.json({ success: true, message: "Slide deleted successfully", id });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting slide" });
    }
};

/* ================= UPDATE SLIDE ================= */
export const updateSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        let slide = await Slide.findById(id);
        if (!slide) {
            return res.status(404).json({ success: false, message: "Slide not found" });
        }

        if (title) slide.title = title;
        if (description) slide.description = description;

        if (req.file) {
            const cloudinaryUrl = await uploadToCloudinary(req.file.path);
            if (cloudinaryUrl) {
                slide.image = cloudinaryUrl;
            } else {
                return res.status(500).json({ success: false, message: "Image upload failed on Cloudinary" });
            }
        }

        await slide.save();

        res.json({
            success: true,
            message: "Slide updated successfully",
            slide
        });
    } catch (err) {
        console.error("Update Slide Controller Error:", err);
        res.status(500).json({
            success: false,
            message: "Error updating slide",
            error: err.message
        });
    }
};
