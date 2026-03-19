import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectLoggedInUser, updateUser } from "../Features/Userslice.js";
import "../Pages/EditProfile.css";
import { toast } from 'react-toastify';

export default function EditProfile() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectLoggedInUser);
  const [file, setFile] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone
      });
    } else {
      navigate("/login");
    }
  }, [user, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("role", user.role); // Maintain existing role
      if (file) {
        formData.append("profileImage", file);
      }

      await dispatch(updateUser({ id: user._id, updatedData: formData })).unwrap();
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      toast.error("Failed to update profile: " + err);
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h1>Edit Profile</h1>
        <p>Update your profile information below.</p>

        <form className="edit-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Phone Number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: "Enter a valid phone number"
                }
              })}
            />
            {errors.phone && <p className="error">{errors.phone.message}</p>}
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/profile")}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
