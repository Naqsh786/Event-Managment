import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import "../Pages/Registerform.css";
import { toast } from 'react-toastify';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import {
  registerUser,
  selectLoading,
  selectRegisterError,
  checkMainAdminExists,
  selectMainAdminExists,
  googleLogin
} from "../Features/Userslice.js";

const EyeIcon = ({ show }) => (
  <i className={`fa-solid ${show ? "fa-eye" : "fa-eye-slash"}`}></i>
);

// Custom Styled Google Button for a Permanent Look
const CustomGoogleButton = ({ onClick, text, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    style={{
      width: '100%',
      maxWidth: '380px',
      padding: '12px 16px',
      background: '#ffffff',
      color: '#3c4043',
      border: '1px solid #dadce0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      fontFamily: "'Google Sans', Roboto, arial, sans-serif",
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}
    onMouseOver={(e) => { 
      e.currentTarget.style.backgroundColor = '#f8faff'; 
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(66, 133, 244, 0.15)'; 
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = '#4285f4';
    }}
    onMouseOut={(e) => { 
      e.currentTarget.style.backgroundColor = '#ffffff'; 
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; 
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = '#dadce0';
    }}
  >
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.63z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.85.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.35C2.43 15.99 5.46 18 9 18z"/>
      <path fill="#FBBC05" d="M3.96 10.7c-.18-.54-.28-1.12-.28-1.7s.1-1.16.28-1.7V4.95H.95C.35 6.16 0 7.54 0 9s.35 2.84.95 4.05l3.01-2.35z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.46 0 2.43 2.01.95 4.95l3.01 2.35c.71-2.13 2.7-3.71 5.04-3.71z"/>
    </svg>
    <span>{text}</span>
  </button>
);

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectLoading);
  const registerError = useSelector(selectRegisterError);
  const mainAdminExists = useSelector(selectMainAdminExists);

  const [file, setFile] = React.useState(null);

  React.useEffect(() => {
    dispatch(checkMainAdminExists());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // Added setValue for pre-filling
  } = useForm();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [googleData, setGoogleData] = React.useState(null); // Track if Google was used


  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.fullName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    formData.append("cpassword", data.confirmPassword);
    const role = mainAdminExists ? "user" : "Admin";
    formData.append("role", role);

    if (googleData?.googleId) {
      formData.append("googleId", googleData.googleId);
    }

    if (file) {
      formData.append("profileImage", file);
    }

    try {
      const resultAction = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Registration successful!");
        navigate("/verify-email", { state: { email: data.email } });
        reset();
        setGoogleData(null);
      }
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
        const decoded = await response.json();
        
        // Pre-fill the form
        setValue("fullName", decoded.name);
        setValue("email", decoded.email);
        setGoogleData({ googleId: decoded.sub });
        
        toast.info("Details fetched from Google! Please set a password and phone number.");
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to get data from Google");
      }
    },
    onError: () => toast.error("Google Registration Failed")
  });




  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Register to get started</p>

        {registerError && <p className="error">{registerError}</p>}

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="file-group">
            <label className="file-label">Profile Image</label>
            <input
              type="file"
              className="file-input"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*"
            />
          </div>

          <input
            type="text"
            placeholder="Full Name"
            {...register("fullName", { required: "Name is required" })}
          />
          {errors.fullName && (
            <span className="error">{errors.fullName.message}</span>
          )}

          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email",
              },
            })}
          />
          {errors.email && (
            <span className="error">{errors.email.message}</span>
          )}

          <input
            type="tel"
            placeholder="Phone"
            {...register("phone", { required: "Phone is required" })}
          />
          {errors.phone && (
            <span className="error">{errors.phone.message}</span>
          )}



          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              <EyeIcon show={showPassword} />
            </span>
          </div>
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value, formValues) =>
                  value === formValues.password || "Passwords do not match",
              })}
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <EyeIcon show={showConfirmPassword} />
            </span>
          </div>
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword.message}</span>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="google-login-separator" style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
          <span style={{ background: 'var(--bg-secondary)', padding: '0 10px', color: '#888', fontSize: '0.9rem' }}>OR</span>
          <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, zIndex: -1, border: '0.5px solid #333' }} />
        </div>

        <div className="google-login-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CustomGoogleButton 
            onClick={() => handleGoogleSignup()} 
            text="Sign up with Google" 
            loading={loading}
          />
        </div>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link" style={{ display: 'inline-block', padding: '10px', position: 'relative', zIndex: 10 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
