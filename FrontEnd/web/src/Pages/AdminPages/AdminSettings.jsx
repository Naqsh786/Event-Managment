import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { selectLoggedInUser, updateUser, changePassword, logoutUser, deleteUser } from "../../Features/Userslice";
import { useNavigate } from "react-router-dom";
import "./AdminSettings.css";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const EyeIcon = ({ show }) => (
  <i className={`fa-solid ${show ? "fa-eye" : "fa-eye-slash"}`}></i>
);
const AdminSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectLoggedInUser);
  const [file, setFile] = React.useState(null);
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const onDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Delete Account?',
      text: "Are you sure you want to delete your profile? This will permanently remove your account from the website.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUser(user._id)).unwrap();
        dispatch(logoutUser());
        navigate("/");
        toast.success("Account deleted successfully.");
      } catch (err) {
        toast.error(err || "Failed to delete account");
      }
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  // Reset profile form when user data is available or changes
  React.useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        phone: user.phone || "",
      });
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const onUpdateProfile = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      if (file) {
        formData.append("profileImage", file);
      }

      await dispatch(updateUser({ id: user._id, updatedData: formData })).unwrap();
      toast.success("Profile updated successfully!");
      setFile(null); // Clear file after success
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  const onChangePassword = async (data) => {
    try {
      await dispatch(
        changePassword({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        })
      ).unwrap();
      toast.success("Password changed successfully!");
      resetPassword();
    } catch (err) {
      toast.error(err || "Failed to change password");
    }
  };

  return (
    <div className="admin-settings-page">
      <h1 className="dashboard-title">Settings</h1>
      <p className="welcome-text">Manage your admin profile and system preferences.</p>

      <div className="settings-grid">
        {/* Profile Info Card */}
        <div className="settings-card">
          <h3>Profile Information</h3>
          <form className="admin-form" onSubmit={handleSubmitProfile(onUpdateProfile)}>
            <div className="form-group">
              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="file-input-settings"
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Admin Name"
                {...registerProfile("name", { required: "Name is required" })}
              />
              {profileErrors.name && <span className="error-msg">{profileErrors.name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                autoComplete="tel"
                placeholder="Phone Number"
                {...registerProfile("phone", { required: "Phone number is required" })}
              />
              {profileErrors.phone && <span className="error-msg">{profileErrors.phone.message}</span>}
            </div>
            <button type="submit" className="save-btn">
              Update Profile
            </button>
          </form>
        </div>

        {/* Security Card */}
        <div className="settings-card">
          <h3>Security</h3>
          <form className="admin-form" onSubmit={handleSubmitPassword(onChangePassword)}>
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="••••••"
                  {...registerPassword("oldPassword", { required: "Current password is required" })}
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  <EyeIcon show={showOldPassword} />
                </span>
              </div>
              {passwordErrors.oldPassword && (
                <span className="error-msg">{passwordErrors.oldPassword.message}</span>
              )}
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="password-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <EyeIcon show={showNewPassword} />
                </span>
              </div>
              {passwordErrors.newPassword && (
                <span className="error-msg">{passwordErrors.newPassword.message}</span>
              )}
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••"
                  {...registerPassword("confirmPassword", {
                    required: "Confirm your password",
                    validate: (val, formValues) => val === formValues.newPassword || "Passwords do not match",
                  })}
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <EyeIcon show={showConfirmPassword} />
                </span>
              </div>
              {passwordErrors.confirmPassword && (
                <span className="error-msg">{passwordErrors.confirmPassword.message}</span>
              )}
            </div>
            <button type="submit" className="save-btn">
              Change Password
            </button>
          </form>
        </div>
      </div>

      <div className="danger-zone-section" style={{ marginTop: '40px' }}>
        <div className="settings-card danger-card">
          <h3 style={{ color: '#dc2626' }}>Danger Zone</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            Deleting your account is permanent and cannot be undone. All your data will be removed.
          </p>
          <button className="delete-profile-btn" onClick={onDeleteAccount}>
            Delete My Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
