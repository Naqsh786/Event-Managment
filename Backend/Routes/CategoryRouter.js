import express from "express";
import { addCategory, getAllCategories, deleteCategory, updateCategory } from "../Controllers/CategoryController.js";
import { protect } from "../Middleware/auth.js";
import upload from "../Middleware/upload.js";

const CategoryRouter = express.Router();

// Public Route
CategoryRouter.get("/getall", getAllCategories);

// Admin Protected Routes
CategoryRouter.post("/add", protect, addCategory);
CategoryRouter.put("/update/:id", protect, updateCategory);
CategoryRouter.delete("/delete/:id", protect, deleteCategory);

export default CategoryRouter;
