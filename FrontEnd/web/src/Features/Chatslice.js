import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { CHAT_API_URL as API_URL } from "../utils/apiConfig.js";

/* =========================
   THUNKS
========================= */

// Get Admin ID (for general user to know who the admin is)
export const getAdminIdAction = createAsyncThunk(
    "chat/getAdminId",
    async (_, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${API_URL}/admin-id`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.adminId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch Chat History
export const fetchHistory = createAsyncThunk(
    "chat/fetchHistory",
    async (otherUserId, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${API_URL}/history/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.messages;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch Interacted Users (Admin)
export const fetchInteractedUsers = createAsyncThunk(
    "chat/fetchInteractedUsers",
    async (_, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${API_URL}/interacted`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.users;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch Total Unread Chat Count
export const fetchUnreadChatCount = createAsyncThunk(
    "chat/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${API_URL}/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.count;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Mark Messages as Read
export const markMessagesAsRead = createAsyncThunk(
    "chat/markRead",
    async (senderId, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${API_URL}/mark-read/${senderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return senderId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   SLICE
========================= */
const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: [],
        interactedUsers: [],
        unreadChatCount: 0,
        adminId: null,
        loading: false,
        error: null,
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        updateMessageInList: (state, action) => {
            const { messageId, newMessage, status } = action.payload;
            state.messages = state.messages.map(m => {
                if (m._id === messageId) {
                    return { ...m, ...(newMessage && { message: newMessage, edited: true }), ...(status && { status }) };
                }
                return m;
            });
        },
        updateAllMessagesStatus: (state, action) => {
            const { status, receiverId } = action.payload;
            state.messages = state.messages.map(m => {
                if (m.receiver === receiverId) {
                    return { ...m, status };
                }
                return m;
            });
        },
        removeMessageFromList: (state, action) => {
            state.messages = state.messages.filter(m => m._id !== action.payload.messageId);
        },
        setUnreadChatCount: (state, action) => {
            state.unreadChatCount = action.payload;
        },
        incrementUnreadChatCount: (state) => {
            state.unreadChatCount += 1;
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Admin ID
            .addCase(getAdminIdAction.fulfilled, (state, action) => {
                state.adminId = action.payload;
            })
            // Fetch History
            .addCase(fetchHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Interacted Users
            .addCase(fetchInteractedUsers.fulfilled, (state, action) => {
                state.interactedUsers = action.payload;
            })
            // Fetch Unread Count
            .addCase(fetchUnreadChatCount.fulfilled, (state, action) => {
                state.unreadChatCount = action.payload;
            })
            // Mark Read
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                // Optionally update interacted users state if we're storing unread count there
                state.interactedUsers = state.interactedUsers.map(u =>
                    u._id === action.payload ? { ...u, unreadCount: 0 } : u
                );
            });
    }
});

/* =========================
   SELECTORS
========================= */
export const selectMessages = (state) => state.chat.messages;
export const selectInteractedUsers = (state) => state.chat.interactedUsers;
export const selectUnreadChatCount = (state) => state.chat.unreadChatCount;
export const selectAdminId = (state) => state.chat.adminId;
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatError = (state) => state.chat.error;

export const {
    addMessage,
    updateMessageInList,
    updateAllMessagesStatus,
    removeMessageFromList,
    setUnreadChatCount,
    incrementUnreadChatCount,
    clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;
