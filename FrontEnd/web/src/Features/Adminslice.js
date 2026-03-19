import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { USER_API_URL as API_URL, ADMIN_API_URL } from "../utils/apiConfig.js";

/* =========================
   GET ALL USERS (ADMIN)
========================= */
export const fetchAllUsers = createAsyncThunk(
    "admin/fetchAllUsers",
    async (params, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${ADMIN_API_URL}/getall/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   DELETE USER (ADMIN)
========================= */
export const deleteUser = createAsyncThunk(
    "admin/deleteUser",
    async (id, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            // NOTE: deleteUser was not moved to AdminController, so it stays on API_URL (/user)
            await axios.delete(`${API_URL}/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   APPROVE ADMIN
========================= */
export const approveAdmin = createAsyncThunk(
    "admin/approveAdmin",
    async (id, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            // Update profile info is still on /user/update
            const res = await axios.put(`${API_URL}/update/${id}`, { isAdminApproved: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   PROMOTE USER TO ADMIN
========================= */
export const promoteUserToAdmin = createAsyncThunk(
    "admin/promoteUserToAdmin",
    async (id, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.put(`${ADMIN_API_URL}/promote-to-admin/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   TOGGLE USER STATUS (ACTIVE/INACTIVE)
========================= */
export const toggleUserStatus = createAsyncThunk(
    "admin/toggleUserStatus",
    async (id, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.put(`${ADMIN_API_URL}/toggle-status/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   REJECT ADMIN (DELETE)
========================= */
export const rejectAdmin = createAsyncThunk(
    "admin/rejectAdmin",
    async (id, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${ADMIN_API_URL}/reject-admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* =========================
   SLICE
========================= */
const adminSlice = createSlice({
    name: "admin",
    initialState: {
        loading: false,
        userData: [],
        error: null,
        dashboardStats: null,
    },
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH ALL USERS
            .addCase(fetchAllUsers.pending, (state, action) => {
                if (!action.meta.arg?.isSilent) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE USER
            .addCase(deleteUser.pending, (state) => { state.loading = true; })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = state.userData.filter(u => u._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // APPROVE ADMIN
            .addCase(approveAdmin.pending, (state) => { state.loading = true; })
            .addCase(approveAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = state.userData.map(u => u._id === action.payload._id ? action.payload : u);
            })
            .addCase(approveAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // PROMOTE USER TO ADMIN
            .addCase(promoteUserToAdmin.pending, (state) => { state.loading = true; })
            .addCase(promoteUserToAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = state.userData.map(u => u._id === action.payload._id ? action.payload : u);
            })
            .addCase(promoteUserToAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // REJECT ADMIN
            .addCase(rejectAdmin.pending, (state) => { state.loading = true; })
            .addCase(rejectAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = state.userData.filter(u => u._id !== action.payload);
            })
            .addCase(rejectAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const selectAdminUserData = (state) => state.admin.userData;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

export const { clearAdminError } = adminSlice.actions;

export default adminSlice.reducer;
