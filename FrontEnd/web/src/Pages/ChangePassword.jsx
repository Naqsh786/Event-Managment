import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePassword, selectChangePasswordMsg, selectChangePasswordError, selectLoading } from "../Features/Userslice";
import "../Pages/ChangePassword.css";
import { toast } from 'react-toastify';

const EyeIcon = ({ show }) => (
  <i className={`fa-solid ${show ? "fa-eye" : "fa-eye-slash"}`}></i>
);

export default function ChangePassword() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectLoading);
  const successMsg = useSelector(selectChangePasswordMsg);
  const errorMsg = useSelector(selectChangePasswordError);

  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);



  const onSubmit = async (data) => {
    try {
      // Redux action requires oldPassword and newPassword
      await dispatch(changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      })).unwrap();

      toast.success("Password changed successfully!");
      navigate("/profile");
      reset();
    } catch {
      // Error handled via redux state
    }
  };



  return (
    <div className="change-container">
      <div className="change-card">
        <h1>Change Password</h1>
        <p>Ensure your account is using a long, random password to stay secure.</p>

        <form className="change-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Old Password */}
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Old Password"
                {...register("oldPassword", {
                  required: "Old password is required",
                })}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                <EyeIcon show={showOldPassword} />
              </span>
            </div>
            {errors.oldPassword && (
              <span className="error">{errors.oldPassword.message}</span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <EyeIcon show={showNewPassword} />
              </span>
            </div>
            {errors.newPassword && (
              <span className="error">{errors.newPassword.message}</span>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value, formValues) =>
                    value === formValues.newPassword || "Passwords do not match",
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
          </div>

          {errorMsg && <p className="error" style={{ marginBottom: "10px" }}>{errorMsg}</p>}
          {successMsg && <p className="success" style={{ marginBottom: "10px" }}>{successMsg}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
