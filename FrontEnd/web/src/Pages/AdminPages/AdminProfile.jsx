import { useNavigate } from "react-router-dom";
import { selectLoggedInUser, selectLoading, loadUser } from "../../Features/Userslice";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./AdminProfile.css";
import { useSelector, useDispatch } from "react-redux";
import React from "react";

export default function AdminProfile() {
    const user = useSelector(selectLoggedInUser);
    const loading = useSelector(selectLoading);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        // If not loading and no user, redirect to login
        if (!loading && !user && !sessionStorage.getItem("token")) {
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
    }, [user, loading, navigate, dispatch]);

    if (loading || !user) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading Admin Profile...</p>
            </div>
        );
    }

    const imageUrl = user.profileImage
        ? (user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE_URL}/${user.profileImage.replace(/\\/g, "/")}`)
        : null;

    return (
        <div className="admin-profile-container">
            <div className="header-flex" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="dashboard-title">System Profile</h1>
                    <p className="welcome-text">Manage your administrative identity and access credentials.</p>
                </div>
            </div>
            <div className="admin-profile-card">
                <div className="admin-profile-header">
                    <div className="admin-avatar-container">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Admin Logo"
                                className="admin-profile-logo"
                                onError={(e) => {
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                }}
                            />
                        ) : (
                            <div className="admin-initials-avatar">
                                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                            </div>
                        )}
                    </div>
                    <h1 style={{ textTransform: 'capitalize' }}>{user.name}</h1>
                    <span className="admin-badge">System Administrator</span>
                </div>

                <div className="admin-profile-content">
                    <div className="profile-info-section">
                        <h3>Contact Information</h3>
                        <div className="info-row">
                            <span className="label">Full Name:</span>
                            <span className="value">{user.name}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Email Address:</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Phone Number:</span>
                            <span className="value">{user.phone}</span>
                        </div>
                    </div>

                    <div className="profile-info-section">
                        <h3>Account Status</h3>
                        <div className="info-row">
                            <span className="label">Role:</span>
                            <span className="value badge-role">{user.role}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Verified:</span>
                            <span className="value verified-text">{user.verifyuser ? "Yes" : "No"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
