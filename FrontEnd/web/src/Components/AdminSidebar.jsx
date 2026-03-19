import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectLoggedInUser } from '../Features/Userslice';
import axios from 'axios';
import { socket } from '../utils/socket';
import {
    fetchUnreadChatCount,
    selectUnreadChatCount,
    setUnreadChatCount,
    incrementUnreadChatCount
} from '../Features/Chatslice';
import { API_BASE_URL } from '../utils/apiConfig';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [adminTheme, setAdminTheme] = useState(localStorage.getItem("admin_theme") || "dark");
    const dispatch = useDispatch();
    const user = useSelector(selectLoggedInUser);
    const location = useLocation();
    const navigate = useNavigate();
    const unreadChatCount = useSelector(selectUnreadChatCount);
    const [unreadContactCount, setUnreadContactCount] = useState(0);
    const [unreadReviewCount, setUnreadReviewCount] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", adminTheme);
        localStorage.setItem("admin_theme", adminTheme);
    }, [adminTheme]);

    const toggleAdminTheme = () => {
        setAdminTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    };

    useEffect(() => {
        const fetchUnreadCounts = async () => {
            if (user && user.role === "Admin") {
                try {
                    const token = sessionStorage.getItem("token");
                    // Chat unread via Redux
                    dispatch(fetchUnreadChatCount());

                    // Contact unread (keep local for now)
                    const contactRes = await axios.get(`${API_BASE_URL}/contact/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUnreadContactCount(contactRes.data.count);

                    // Review unread
                    const reviewRes = await axios.get(`${API_BASE_URL}/review/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUnreadReviewCount(reviewRes.data.count);
                } catch (err) {
                    console.error("Error fetching admin unread counts", err);
                }
            }
        };

        const markAsRead = async () => {
            if (user && user.role === "Admin") {
                const token = sessionStorage.getItem("token");
                
                // Mark messages read
                if (location.pathname === "/admin/messages") {
                    try {
                        await axios.put(`${API_BASE_URL}/contact/mark-admin-read`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUnreadContactCount(0);
                    } catch (err) {
                        console.error("Error marking contacts read", err);
                    }
                }

                // Mark reviews read
                if (location.pathname === "/admin/reviews") {
                    try {
                        await axios.put(`${API_BASE_URL}/review/mark-read`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUnreadReviewCount(0);
                    } catch (err) {
                        console.error("Error marking reviews read", err);
                    }
                }
            }
        };

        fetchUnreadCounts();
        markAsRead();

        if (user && user.role === "Admin") {
            socket.connect();
            socket.emit("join_room", { userId: user._id, email: user.email });

            socket.on("receive_message", () => {
                if (location.pathname !== "/admin/chat") {
                    dispatch(incrementUnreadChatCount());
                }
            });

            socket.on("new_contact_message", () => {
                if (location.pathname !== "/admin/messages") {
                    setUnreadContactCount(prev => prev + 1);
                }
            });

            socket.on("message_status_update", (data) => {
                if (data.status === "read") {
                    fetchUnreadCounts();
                }
            });

            return () => {
                socket.off("receive_message");
                socket.off("message_status_update");
            };
        }
    }, [user, location.pathname, dispatch]);

    const imageUrl = user?.profileImage
        ? (user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE_URL}/${user.profileImage.replace(/\\/g, "/")}`)
        : null;

    return (
        <>
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} onTouchStart={closeSidebar}></div>}

            <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Majestic Admin Panel</h3>
                    <button className="close-sidebar-btn" onClick={closeSidebar}>×</button>
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                        >
                            Dashboard
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                        >
                            User Data
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/category"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                        >
                            Category
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/slides"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                        >
                            Manage Slides
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/events"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                        >
                            Events
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/reviews"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span>Reviews</span>
                            {unreadReviewCount > 0 && location.pathname !== "/admin/reviews" && <span className="sidebar-badge">{unreadReviewCount}</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/messages"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span>User Messages</span>
                            {unreadContactCount > 0 && location.pathname !== "/admin/messages" && <span className="sidebar-badge">{unreadContactCount}</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/chat"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={() => { closeSidebar(); dispatch(setUnreadChatCount(0)); }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span>Chat Messages</span>
                            {unreadChatCount > 0 && location.pathname !== "/admin/chat" && <span className="sidebar-badge">{unreadChatCount}</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/settings"
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                            onClick={closeSidebar}
                        >
                            Settings
                        </NavLink>
                    </li>
                </ul>

                {/* Admin Theme Toggle */}
                <div className="sidebar-theme-toggle">
                    <button
                        onClick={toggleAdminTheme}
                        className="theme-toggle-sidebar-btn"
                        title={adminTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {adminTheme === "dark" ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                                <span>Dark Mode</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="sidebar-bottom">
                    <NavLink
                        to="/admin/profile"
                        className={({ isActive }) => (isActive ? "active-link profile-link" : "profile-link")}
                        onClick={closeSidebar}
                    >
                        <div className="sidebar-profile">
                            {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt="Profile"
                                  className="mini-avatar-img"
                                  onError={(e) => {
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                  }}
                                />
                            ) : (
                                <div className="mini-avatar-initials">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                                </div>
                            )}
                            <span>Admin Profile</span>
                        </div>
                    </NavLink>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
