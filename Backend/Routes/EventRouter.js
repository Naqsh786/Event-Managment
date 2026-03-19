import express from "express";
import { createEvent, getEvents, getEventsByCategory, deleteEvent, updateEvent, getEventById } from "../Controllers/EventController.js";
import upload from "../Middleware/upload.js"; // Assuming multer middleware exists for image uploads

const router = express.Router();

router.post("/add", upload.single("image"), createEvent);
router.get("/all", getEvents);
router.get("/:id", getEventById);
router.get("/category/:categoryId", getEventsByCategory);
router.delete("/delete/:id", deleteEvent);
router.put("/update/:id", upload.single("image"), updateEvent);

export default router;
