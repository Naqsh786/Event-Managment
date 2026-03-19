import express from "express";
import { addSlide, getAllSlides, deleteSlide, updateSlide } from "../Controllers/SlideController.js";
import { protect } from "../Middleware/auth.js";
import upload from "../Middleware/upload.js";

const SlideRouter = express.Router();

// Public Route
SlideRouter.get("/getall", getAllSlides);

// Admin Protected Routes
SlideRouter.post("/add", protect, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }
        next();
    });
}, addSlide);

SlideRouter.put("/update/:id", protect, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }
        next();
    });
}, updateSlide);

SlideRouter.delete("/delete/:id", protect, deleteSlide);

export default SlideRouter;
