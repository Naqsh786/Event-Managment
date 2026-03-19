import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser, resendOtp, selectVerifyCodeMsg, selectVerifyCodeError, selectLoading } from "../Features/Userslice";
import "../Pages/VerifyEmail.css";
import { toast } from 'react-toastify';
export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = useSelector(selectLoading);
  const verifyMsg = useSelector(selectVerifyCodeMsg);
  const verifyError = useSelector(selectVerifyCodeError);

  const [email] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);
  const canResend = timer === 0;

  useEffect(() => {
    if (!location.state || !location.state.email) {
      toast.warning("No email provided. Please register first.");
      navigate("/register");
    }
  }, [location.state, navigate]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);



  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
        toast.warning("Enter a valid 6-digit code");
        return;
    }
    try {
      const result = await dispatch(verifyUser({ email, code })).unwrap();

      if (result.user && result.user.role === "Admin") {
        toast.success("Verification successful! Your request has been sent to the admin for approval. Please wait for an email confirmation before logging in.");
        navigate("/");
      } else {
        toast.success("Code verified! Redirecting to login...");
        navigate("/login");
      }
    } catch {
      // Error handled by redux state
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    try {
      await dispatch(resendOtp({ email })).unwrap();
      toast.success("New verification code sent!");
      setTimer(60);
    } catch (err) {
      toast.error(err || "Failed to resend code");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>Verify Your Email</h1>
        <p>Enter the 6-digit code sent to: <strong>{email}</strong></p>

        <form className="verify-form" onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter verification code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/, ""))}
            required
            autoFocus
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="resend">
          {canResend ? (
            <p>Didn't receive code? <span onClick={handleResendCode}>Resend Code</span></p>
          ) : (
            <p>Resend code in <strong>{timer}s</strong></p>
          )}
        </div>

        {verifyMsg && <p className="success">{verifyMsg}</p>}
        {verifyError && <p className="error">{verifyError}</p>}
      </div>
    </div>
  );
}
