import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { SLIDE_API_URL as API_URL } from "../utils/apiConfig.js";

/* ================= ADD SLIDE ================= */
export const addSlide = createAsyncThunk(
    "slide/addSlide",
    async (formData, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.post(`${API_URL}/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return res.data.slide;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            return rejectWithValue(errorMsg);
        }
    }
);

/* ================= GET ALL SLIDES ================= */
export const fetchSlides = createAsyncThunk(
    "slide/fetchSlides",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_URL}/getall`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* ================= DELETE SLIDE ================= */
export const deleteSlide = createAsyncThunk(
    "slide/deleteSlide",
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

/* ================= UPDATE SLIDE ================= */
export const updateSlide = createAsyncThunk(
    "slide/updateSlide",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.put(`${API_URL}/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return res.data.slide;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            return rejectWithValue(errorMsg);
        }
    }
);

const slideSlice = createSlice({
    name: "slide",
    initialState: {
        slides: [],
        loading: false,
        error: null,
        addSuccess: false
    },
    reducers: {
        clearSlideErrors: (state) => {
            state.error = null;
            state.addSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // ADD
            .addCase(addSlide.pending, (state) => { state.loading = true; state.error = null; state.addSuccess = false; })
            .addCase(addSlide.fulfilled, (state, action) => {
                state.loading = false;
                state.slides.unshift(action.payload);
                state.addSuccess = true;
            })
            .addCase(addSlide.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // FETCH
            .addCase(fetchSlides.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSlides.fulfilled, (state, action) => { state.loading = false; state.slides = action.payload; })
            .addCase(fetchSlides.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // DELETE
            .addCase(deleteSlide.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteSlide.fulfilled, (state, action) => {
                state.loading = false;
                state.slides = state.slides.filter(s => s._id !== action.payload);
            })
            .addCase(deleteSlide.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // UPDATE
            .addCase(updateSlide.pending, (state) => { state.loading = true; state.error = null; state.addSuccess = false; })
            .addCase(updateSlide.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.slides.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.slides[index] = action.payload;
                }
                state.addSuccess = true;
            })
            .addCase(updateSlide.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export const { clearSlideErrors } = slideSlice.actions;
export const selectAllSlides = (state) => state.slide.slides;
export const selectSlideLoading = (state) => state.slide.loading;
export const selectSlideError = (state) => state.slide.error;
export const selectSlideAddSuccess = (state) => state.slide.addSuccess;

export default slideSlice.reducer;
