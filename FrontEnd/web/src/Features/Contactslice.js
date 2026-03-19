import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { CONTACT_API_URL as API_URL } from "../utils/apiConfig.js";

/* =========================
   SEND MESSAGE
========================= */
export const sendMessageAction = createAsyncThunk(
    "contact/sendMessage",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_URL}/send`, formData);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   FETCH ALL MESSAGES (ADMIN)
========================= */
export const fetchAllMessages = createAsyncThunk(
    "contact/fetchAllMessages",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_URL}/getall`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   UPDATE MESSAGE STATUS (ADMIN)
========================= */
export const updateMessageStatusAction = createAsyncThunk(
    "contact/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            await axios.put(`${API_URL}/update-status/${id}`, { status });
            return { id, status }; // Return the ID to filter out from local state
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   FETCH USER NOTIFICATIONS (USER)
========================= */
export const fetchUserNotifications = createAsyncThunk(
    "contact/fetchUserNotifications",
    async (email, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_URL}/user-notifications/${email}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const contactSlice = createSlice({
    name: "contact",
    initialState: {
        loading: false,
        messages: [],
        error: null,
        success: false,
    },
    reducers: {
        resetContactState: (state) => {
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // SEND MESSAGE
            .addCase(sendMessageAction.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendMessageAction.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(sendMessageAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL MESSAGES
            .addCase(fetchAllMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchAllMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE MESSAGE STATUS
            .addCase(updateMessageStatusAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateMessageStatusAction.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the message from local state as it's no longer 'pending'
                state.messages = state.messages.filter(m => m._id !== action.payload.id);
            })
            .addCase(updateMessageStatusAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // USER NOTIFICATIONS
            .addCase(fetchUserNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload; // Reuse messages array for user view
            })
            .addCase(fetchUserNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const selectMessages = (state) => state.contact.messages;
export const selectContactLoading = (state) => state.contact.loading;
export const selectContactSuccess = (state) => state.contact.success;
export const selectContactError = (state) => state.contact.error;

export const { resetContactState } = contactSlice.actions;

export default contactSlice.reducer;
