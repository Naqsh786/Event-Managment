import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export default Category;
