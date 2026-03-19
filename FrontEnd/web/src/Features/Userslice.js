import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { USER_API_URL, ADMIN_API_URL } from "../utils/apiConfig.js";



/* =========================
   REGISTER USER
========================= */
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/register/`, formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   VERIFY USER (EMAIL OTP)
========================= */
export const verifyUser = createAsyncThunk(
  "user/verifyUser",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/verify/`, { email, code });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   RESEND OTP
========================= */
export const resendOtp = createAsyncThunk(
  "user/resendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/resendotp/`, { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   LOGIN USER
========================= */
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (formdata, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${USER_API_URL}/login`,
        formdata
      );
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("token", res.data.token);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   GOOGLE LOGIN
========================= */
export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/google-login`, { token });
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("token", res.data.token);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



/* =========================
   GET ALL USERS
========================= */
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${USER_API_URL}/getall/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   UPDATE USER
========================= */
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.put(`${USER_API_URL}/update/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // If we are updating ourselves, sync sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem("user"));
      if (currentUser && currentUser._id === id) {
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   DELETE USER
========================= */
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${USER_API_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/forgot`, { email });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   VERIFY RESET CODE
========================= */
export const verifyResetCode = createAsyncThunk(
  "user/verifyResetCode",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/verifycode/`, { email, code });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ email, code, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${USER_API_URL}/reset/`, { email, code, newPassword });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   CHANGE PASSWORD (LOGGED IN USER)
========================= */
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.put(
        `${USER_API_URL}/editpassword/`,
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.message;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   LOAD USER (ON REFRESH)
 ========================= */
export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return null;
      const res = await axios.get(`${USER_API_URL}/get/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.user;
    } catch (err) {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   CHECK MAIN ADMIN EXISTS
========================= */
export const checkMainAdminExists = createAsyncThunk(
  "user/checkMainAdminExists",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ADMIN_API_URL}/check-main-admin`);
      return res.data.exists;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =========================
   SLICE
========================= */
const getInitialUser = () => {
  try {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    userData: [],
    loggedInUser: getInitialUser(),
    isAuthenticated: !!sessionStorage.getItem("token"),
    mainAdminExists: false,

    // Errors
    registerError: null,
    loginError: null,
    forgotPasswordError: null,
    verifyCodeError: null,
    resetPasswordError: null,
    changePasswordError: null,
    error: null,

    // Messages
    forgotPasswordMsg: null,
    verifyCodeMsg: null,
    resetPasswordMsg: null,
    changePasswordMsg: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.registerError = null;
      state.loginError = null;
      state.forgotPasswordError = null;
      state.verifyCodeError = null;
      state.resetPasswordError = null;
      state.changePasswordError = null;
      state.error = null;
      state.forgotPasswordMsg = null;
      state.verifyCodeMsg = null;
      state.resetPasswordMsg = null;
      state.changePasswordMsg = null;
    },
    logoutUser: (state) => {
      state.loggedInUser = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.registerError = null;
      state.loginError = null;
      state.forgotPasswordError = null;
      state.verifyCodeError = null;
      state.resetPasswordError = null;
      state.changePasswordError = null;
      state.forgotPasswordMsg = null;
      state.verifyCodeMsg = null;
      state.resetPasswordMsg = null;
      state.changePasswordMsg = null;
      state.error = null;
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => { state.loading = true; state.registerError = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.userData.push(action.payload); })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.registerError = action.payload; })

      // VERIFY USER
      .addCase(verifyUser.pending, (state) => { state.loading = true; state.verifyCodeMsg = null; state.verifyCodeError = null; })
      .addCase(verifyUser.fulfilled, (state, action) => { state.loading = false; state.verifyCodeMsg = action.payload.message; })
      .addCase(verifyUser.rejected, (state, action) => { state.loading = false; state.verifyCodeError = action.payload; })

      // LOGIN
      .addCase(loginUser.pending, (state) => { state.loading = true; state.loginError = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.loggedInUser = action.payload; state.isAuthenticated = true; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.loginError = action.payload; })

      // GOOGLE LOGIN
      .addCase(googleLogin.pending, (state) => { state.loading = true; state.loginError = null; })
      .addCase(googleLogin.fulfilled, (state, action) => { state.loading = false; state.loggedInUser = action.payload; state.isAuthenticated = true; })
      .addCase(googleLogin.rejected, (state, action) => { state.loading = false; state.loginError = action.payload; })

      // FETCH ALL USERS
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => { state.loading = false; state.userData = action.payload; })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // UPDATE USER
      .addCase(updateUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = state.userData.map(u => u._id === action.payload._id ? action.payload : u);
        if (state.loggedInUser && state.loggedInUser._id === action.payload._id) {
          state.loggedInUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // DELETE USER
      .addCase(deleteUser.pending, (state) => { state.loading = true; })
      .addCase(deleteUser.fulfilled, (state, action) => { state.loading = false; state.userData = state.userData.filter(u => u._id !== action.payload); })
      .addCase(deleteUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.forgotPasswordMsg = null; state.forgotPasswordError = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => { state.loading = false; state.forgotPasswordMsg = action.payload; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.forgotPasswordError = action.payload; })

      // VERIFY RESET CODE
      .addCase(verifyResetCode.pending, (state) => { state.loading = true; state.verifyCodeMsg = null; state.verifyCodeError = null; })
      .addCase(verifyResetCode.fulfilled, (state, action) => { state.loading = false; state.verifyCodeMsg = action.payload; })
      .addCase(verifyResetCode.rejected, (state, action) => { state.loading = false; state.verifyCodeError = action.payload; })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.resetPasswordMsg = null; state.resetPasswordError = null; })
      .addCase(resetPassword.fulfilled, (state, action) => { state.loading = false; state.resetPasswordMsg = action.payload; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.resetPasswordError = action.payload; })

      // CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => { state.loading = true; state.changePasswordMsg = null; state.changePasswordError = null; })
      .addCase(changePassword.fulfilled, (state, action) => { state.loading = false; state.changePasswordMsg = action.payload; })
      .addCase(changePassword.rejected, (state, action) => { state.loading = false; state.changePasswordError = action.payload; })

      // LOAD USER
      .addCase(loadUser.pending, (state) => { state.loading = true; })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.loggedInUser = action.payload;
          state.isAuthenticated = true;
          sessionStorage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.loggedInUser = null;
        state.isAuthenticated = false;
      })

      // CHECK MAIN ADMIN
      .addCase(checkMainAdminExists.fulfilled, (state, action) => {
        state.mainAdminExists = action.payload;
      })

      // RESEND OTP
      .addCase(resendOtp.pending, (state) => { state.loading = true; state.verifyCodeMsg = null; state.verifyCodeError = null; })
      .addCase(resendOtp.fulfilled, (state, action) => { state.loading = false; state.verifyCodeMsg = action.payload.message; })
      .addCase(resendOtp.rejected, (state, action) => { state.loading = false; state.verifyCodeError = action.payload; });
  },
});

/* =========================
   SELECTORS
========================= */
export const selectUserData = (state) => state.user.userData;
export const selectLoggedInUser = (state) => state.user.loggedInUser;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectLoading = (state) => state.user.loading;
export const selectRegisterError = (state) => state.user.registerError;
export const selectLoginError = (state) => state.user.loginError;
export const selectForgotPasswordMsg = (state) => state.user.forgotPasswordMsg;
export const selectVerifyCodeMsg = (state) => state.user.verifyCodeMsg;
export const selectResetPasswordMsg = (state) => state.user.resetPasswordMsg;
export const selectChangePasswordMsg = (state) => state.user.changePasswordMsg;
export const selectForgotPasswordError = (state) => state.user.forgotPasswordError;
export const selectVerifyCodeError = (state) => state.user.verifyCodeError;
export const selectResetPasswordError = (state) => state.user.resetPasswordError;
export const selectChangePasswordError = (state) => state.user.changePasswordError;
export const selectMainAdminExists = (state) => state.user.mainAdminExists;

export const { logoutUser, clearErrors } = userSlice.actions;
export default userSlice.reducer;
