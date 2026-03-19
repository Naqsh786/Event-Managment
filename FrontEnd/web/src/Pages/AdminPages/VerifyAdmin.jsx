import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyResetCode, forgotPassword, selectVerifyCodeMsg, selectVerifyCodeError, selectLoading } from "../../Features/Userslice";
import "./VerifyAdmin.css";
import { toast } from 'react-toastify';

export default function VerifyAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = useSelector(selectLoading);
  const verifyMsg = useSelector(selectVerifyCodeMsg);
  const verifyError = useSelector(selectVerifyCodeError);

  const [email] = useState(location.state?.email || "");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!email) {
      toast.error("No email provided. Please login first.");
      navigate("/login");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.warning("Enter a valid 6-digit code");
      return;
    }

    try {
      await dispatch(verifyResetCode({ email, code })).unwrap();
      toast.success("Code verified! Redirecting to admin dashboard...");
      navigate("/admin/dashboard");
    } catch {
      // Error handled by redux state
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      toast.success("Verification code resent to your email!");
      setCode(""); // Clear the code input
    } catch {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>Admin Verification</h1>
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

        {verifyMsg && <p className="success">{verifyMsg}</p>}
        {verifyError && <p className="error">{verifyError}</p>}

        <p className="resend">
          Didn't receive the code? <span onClick={handleResend}>Resend</span>
        </p>
      </div>
    </div>
  );
}
