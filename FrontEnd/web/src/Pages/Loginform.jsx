import React from "react";
import { useForm, } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectLoading, selectLoginError, forgotPassword, googleLogin } from "../Features/Userslice";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import "../Pages/Loginform.css";
import { toast } from 'react-toastify';

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

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectLoading);
  const loginError = useSelector(selectLoginError);

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm();
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(resultAction)) {
      handlePostLogin(resultAction.payload);
      reset();
    }
  };

  const handlePostLogin = (user) => {
    if (user.role === 'Admin') {
      dispatch(forgotPassword({ email: user.email }))
        .unwrap()
        .then(() => {
          navigate("/admin/verify", { state: { email: user.email } });
        })
        .catch((err) => {
          toast.error("Failed to send verification code: " + err);
        });
    } else {
      toast.success("Login successful!");
      navigate("/");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const resultAction = await dispatch(googleLogin(tokenResponse.access_token));
      if (googleLogin.fulfilled.match(resultAction)) {
        handlePostLogin(resultAction.payload);
      } else {
        toast.error(resultAction.payload || "Google Login failed");
      }
    },
    onError: () => toast.error("Google Login Failed")
  });


  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <p>Welcome back! Please login to your account.</p>

        {loginError && (
          <p className="error">
            {loginError === "User not found or not verified" ? (
              <>
                {loginError}. <Link to="/verify-email" state={{ email: getValues("email") }}>Verify now</Link>
              </>
            ) : (
              loginError
            )}
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
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
          {errors.email && <span className="error">{errors.email.message}</span>}

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              <EyeIcon show={showPassword} />
            </span>
          </div>
          {errors.password && <span className="error">{errors.password.message}</span>}

          <div className="forgot-link-container" style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#d81b60', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="google-login-separator" style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
          <span style={{ background: 'var(--bg-secondary)', padding: '0 10px', color: '#888', fontSize: '0.9rem' }}>OR</span>
          <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, zIndex: -1, border: '0.5px solid #333' }} />
        </div>

        <div className="google-login-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CustomGoogleButton 
            onClick={() => handleGoogleLogin()} 
            text="Continue with Google" 
            loading={loading}
          />
        </div>

        <p className="switch-link">
          Don’t have an account?{" "}
          <span>
            <Link className="register-link" to="/register" style={{ display: 'inline-block', padding: '10px', position: 'relative', zIndex: 10 }}>
              Register
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}
