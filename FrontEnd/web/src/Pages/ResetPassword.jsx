import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  resetPassword,
  verifyResetCode,
  selectResetPasswordMsg,
  selectResetPasswordError,
  selectVerifyCodeError
} from "../Features/Userslice";
import "../Pages/ResetPassword.css";
import { toast } from 'react-toastify';

const EyeIcon = ({ show }) => (
  <i className={`fa-solid ${show ? "fa-eye" : "fa-eye-slash"}`}></i>
);

export default function ResetPassword() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1: Verify Code, 2: Reset Password
  const [email] = useState(location.state?.email || "");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetMsg = useSelector(selectResetPasswordMsg);
  const resetError = useSelector(selectResetPasswordError);
  const verifyError = useSelector(selectVerifyCodeError);

  useEffect(() => {
    if (!email) {
      toast.warning("No email provided. Redirecting to Forgot Password.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const onVerifyCode = async (data) => {
    try {
      await dispatch(verifyResetCode({ email, code: data.code })).unwrap();
      setVerifiedCode(data.code);
      setStep(2);
      reset(); // Clear form for next step
    } catch {
      // Error handled by redux
    }
  };

  const onResetPassword = async (data) => {
    try {
      await dispatch(resetPassword({ email, code: verifiedCode, newPassword: data.password })).unwrap();
      toast.success("Password reset successfully! Login with new password.");
      navigate("/login");
    } catch {
      // Error handled by redux
    }
  };



  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1>{step === 1 ? "Verify Code" : "Reset Password"}</h1>
        <p>{step === 1 ? `Enter the code sent to ${email}` : "Create a new password"}</p>

        {step === 1 && (
          <form className="reset-form" onSubmit={handleSubmit(onVerifyCode)}>
            <input
              type="text"
              placeholder="Enter Verification Code"
              maxLength={6}
              {...register("code", { required: "Code is required" })}
            />
            {errors.code && <p className="error">{errors.code.message}</p>}

            <button type="submit">Verify Code</button>
            {verifyError && <p className="error">{verifyError}</p>}
          </form>
        )}

        {step === 2 && (
          <form className="reset-form" onSubmit={handleSubmit(onResetPassword)}>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon show={showPassword} />
              </span>
            </div>
            {errors.password && <p className="error">{errors.password.message}</p>}

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value, formValues) =>
                    value === formValues.password || "Passwords do not match"
                })}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <EyeIcon show={showConfirmPassword} />
              </span>
            </div>
            {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

            <button type="submit">Reset Password</button>
            {resetMsg && <p className="success">{resetMsg}</p>}
            {resetError && <p className="error">{resetError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
