import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword, selectForgotPasswordMsg, selectForgotPasswordError } from "../Features/Userslice";
import "../Pages/ForgotPassword.css";
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const msg = useSelector(selectForgotPasswordMsg);
  const error = useSelector(selectForgotPasswordError);

  const onSubmit = async (data) => {
    try {
      await dispatch(forgotPassword({ email: data.email })).unwrap();
      toast.success(`Verification code sent to: ${data.email}`);
      navigate("/reset-password", { state: { email: data.email } });
      reset();
    } catch {
      // Error handled by redux
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h1>Forgot Password</h1>
        <p>Enter your email address to receive a verification code.</p>

        <form className="forgot-form" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                message: "Enter a valid email address"
              }
            })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <button type="submit">Send Code</button>
        </form>
        {msg && <p className="success">{msg}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
