import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { EVENT_API_URL as API_URL } from "../utils/apiConfig.js";

// Async Thunks
export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
});

export const fetchEventsByCategory = createAsyncThunk("events/fetchByCategory", async (categoryId) => {
    const response = await axios.get(`${API_URL}/category/${categoryId}`);
    return response.data;
});

export const fetchEventById = createAsyncThunk("events/fetchById", async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
});

export const addEvent = createAsyncThunk("events/addEvent", async (formData) => {
    const response = await axios.post(`${API_URL}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
});

export const deleteEvent = createAsyncThunk("events/deleteEvent", async (id) => {
    await axios.delete(`${API_URL}/delete/${id}`);
    return id; // Return ID to remove from state
});

export const updateEvent = createAsyncThunk("events/updateEvent", async ({ id, formData }) => {
    const response = await axios.put(`${API_URL}/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
});

const eventSlice = createSlice({
    name: "events",
    initialState: {
        events: [],
        categoryEvents: [], // Events specific to a category
        selectedEvent: null, // Single event details
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchEvents.pending, (state) => { state.loading = true; })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch By Category
            .addCase(fetchEventsByCategory.pending, (state) => { state.loading = true; })
            .addCase(fetchEventsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryEvents = action.payload;
            })
            .addCase(fetchEventsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch By ID
            .addCase(fetchEventById.pending, (state) => { state.loading = true; })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedEvent = action.payload;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Add
            .addCase(addEvent.fulfilled, (state, action) => {
                state.events.push(action.payload);
            })
            // Delete
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.events = state.events.filter(event => event._id !== action.payload);
            })
            // Update
            .addCase(updateEvent.fulfilled, (state, action) => {
                const index = state.events.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.events[index] = action.payload;
                }
            });
    },
});

export const selectAllEvents = (state) => state.events.events;
export const selectCategoryEvents = (state) => state.events.categoryEvents;
export const selectSelectedEvent = (state) => state.events.selectedEvent;
export const selectEventLoading = (state) => state.events.loading;

export default eventSlice.reducer;
