import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectLoggedInUser, logoutUser, deleteUser, loadUser } from "../Features/Userslice";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/apiConfig";
import "./Profile.css";
import Swal from 'sweetalert2';
export default function Profile() {
    const user = useSelector(selectLoggedInUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!user && !sessionStorage.getItem("token")) {
            navigate("/login");
        }

        // Listen for updates from other tabs
        const bc = new BroadcastChannel('admin_updates');
        bc.onmessage = (event) => {
            if (event.data === 'REFRESH_DATA' || event.data.type === 'REFRESH_DATA' || event.data.type === 'USER_DELETED') {
                dispatch(loadUser());
            }
        };
        return () => bc.close();
    }, [user, navigate, dispatch]);

    if (!user) {
        return <div className="loading">Loading Profile...</div>;
    }



    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Delete Account?',
            text: "Are you sure you want to delete your account? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            dispatch(deleteUser(user._id)).then(() => {
                dispatch(logoutUser());
                navigate("/register");
            });
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.profileImage ? (
                            <img
                                src={user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE_URL}/${user.profileImage.replace(/\\/g, "/")}`}
                                alt="Profile"
                                className="profile-img-circle"
                                onError={(e) => {
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                }}
                            />
                        ) : (
                            user.name ? user.name.charAt(0).toUpperCase() : "U"
                        )}
                    </div>
                    {/* User requested Name instead of "My Profile" */}
                    <h1 style={{ textTransform: 'capitalize' }}>{user.name}</h1>
                </div>

                <div className="profile-content">
                    {/* LEFT: DETAILS TABLE */}
                    <div className="profile-details">
                        <table className="profile-table">
                            <tbody>
                                <tr>
                                    <td>Name</td>
                                    <td>{user.name}</td>
                                </tr>
                                <tr>
                                    <td>Email</td>
                                    <td>{user.email}</td>
                                </tr>
                                <tr>
                                    <td>Phone</td>
                                    <td>{user.phone}</td>
                                </tr>
                                <tr>
                                    <td>Role</td>
                                    <td>{user.role || "N/A"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div className="profile-actions">
                        <button className="btn-edit" onClick={() => navigate("/edit-profile")}>
                            Edit Profile
                        </button>
                        {user.role === "Admin" && (
                            <button className="btn-admin" onClick={() => navigate("/admin/dashboard")} style={{ background: 'var(--accent-primary)', color: 'black' }}>
                                Admin Dashboard
                            </button>
                        )}
                        {/* Fixed route to match App.jsx "/edit-password" */}
                        <button className="btn-password" onClick={() => navigate("/edit-password")}>
                            Change Password
                        </button>
                        <button className="btn-delete" onClick={handleDelete}>
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* Actions moved inside profile-content */}
            </div>
        </div>
    );
}
