
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { CATEGORY_API_URL as API_URL } from "../utils/apiConfig.js";

/* ================= ADD CATEGORY ================= */
export const addCategory = createAsyncThunk(
    "category/addCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.post(`${API_URL}/add`, categoryData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Add Category Response:", res.data);
            return res.data.category || res.data.data || res.data;
        } catch (err) {
            console.error("Add Category Error:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            return rejectWithValue(errorMsg);
        }
    }
);

/* ================= GET ALL CATEGORIES ================= */
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_URL}/getall`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* ================= DELETE CATEGORY ================= */
export const deleteCategory = createAsyncThunk(
    "category/deleteCategory",
    async (id, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${API_URL}/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ id, name }, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            console.log("Token from sessionStorage:", token);

            if (!token) {
                return rejectWithValue("Token is missing. Please login again.");
            }

            const res = await axios.put(`${API_URL}/update/${id}`, { name }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Update Category Response:", res.data);
            return res.data.category;
        } catch (err) {
            console.error("Update Category Error Object:", err.response?.data || err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "An unknown error occurred during update";
            return rejectWithValue(errorMsg);
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories: [],
        loading: false,
        error: null,
        addSuccess: false // Also used for updates for simplicity in this UI
    },
    reducers: {
        clearCategoryErrors: (state) => {
            state.error = null;
            state.addSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // ADD
            .addCase(addCategory.pending, (state) => { state.loading = true; state.error = null; state.addSuccess = false; })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.unshift(action.payload);
                state.addSuccess = true;
            })
            .addCase(addCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // FETCH
            .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
            .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // DELETE
            .addCase(deleteCategory.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter(c => c._id !== action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // UPDATE
            .addCase(updateCategory.pending, (state) => { state.loading = true; state.error = null; state.addSuccess = false; })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
                state.addSuccess = true;
            })
            .addCase(updateCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export const { clearCategoryErrors } = categorySlice.actions;
export const selectAllCategories = (state) => state.category.categories;
export const selectCategoryLoading = (state) => state.category.loading;
export const selectCategoryError = (state) => state.category.error;
export const selectAddSuccess = (state) => state.category.addSuccess;

export default categorySlice.reducer;
