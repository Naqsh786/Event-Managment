import Category from "../Models/CategorySchema.js";
import mongoose from "mongoose";

/* ================= ADD CATEGORY ================= */
export const addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const newCategory = await Category.create({ name });

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            category: newCategory
        });

    } catch (err) {
        console.error("Add Category Controller Error:", err);
        res.status(500).json({
            success: false,
            message: "Error adding category",
            error: err.message
        });
    }
};

/* ================= GET ALL CATEGORIES ================= */
export const getAllCategories = async (req, res) => {
    try {
        console.log("Controller: Starting getAllCategories...");

        // Use the imported model
        let TargetModel = Category;

        // If imported model is problematic, try to get it directly from mongoose
        if (!TargetModel || !TargetModel.find) {
            console.log("Controller: Category model missing find, trying direct mongoose access...");
            TargetModel = mongoose.models.Category || mongoose.model("Category");
        }

        const categories = await TargetModel.find().sort({ createdAt: -1 });

        console.log(`Controller: Successfully fetched ${categories ? categories.length : 0} categories`);

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        console.error("GET ALL CATEGORIES ERROR:", {
            message: err.message,
            stack: err.stack,
            name: err.name
        });

        return res.status(500).json({
            success: false,
            message: "ULTRA_DEBUG: Fetch Categories failed",
            error: err.message,
            tip: "Please check if your DB has categories and the schema is correct.",
            stack: err.stack
        });
    }
};

/* ================= DELETE CATEGORY ================= */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, message: "Category deleted successfully", id });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting category" });
    }
};

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (err) {
        console.error("Update Category Controller Error:", err);
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: err.message
        });
    }
};
