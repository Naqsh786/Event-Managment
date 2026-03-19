import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectLoggedInUser, logoutUser } from "../Features/Userslice";

import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { socket } from "../utils/socket";
import { API_BASE_URL } from "../utils/apiConfig";
import {
  fetchUnreadChatCount,
  selectUnreadChatCount,
  incrementUnreadChatCount
} from "../Features/Chatslice";

import { selectAllCategories, fetchCategories } from "../Features/Categoryslice";

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector(selectLoggedInUser);
  const categories = useSelector(selectAllCategories);
  const dispatch = useDispatch();
  const location = useLocation();
  const unreadChatCount = useSelector(selectUnreadChatCount);
  const [unreadNotifyCount, setUnreadNotifyCount] = useState(0);
  const dropdownRef = useRef();

  useEffect(() => {
    dispatch(fetchCategories());

    const bc = new BroadcastChannel('category_updates');
    bc.onmessage = (event) => {
      if (event.data === 'REFRESH_CATEGORIES') {
        dispatch(fetchCategories());
      }
    };

    return () => bc.close();
  }, [dispatch]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (user) {
        try {
          const token = sessionStorage.getItem("token");
          dispatch(fetchUnreadChatCount());

          const notifyRes = await axios.get(`${API_BASE_URL}/contact/user-unread-count/${user.email}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadNotifyCount(notifyRes.data.count);
        } catch (err) {
          console.error("Error fetching unread counts", err);
        }
      }
    };

    const markNotifsRead = async () => {
      if (user && location.pathname === "/notifications") {
        try {
          const token = sessionStorage.getItem("token");
          await axios.put(`${API_BASE_URL}/contact/mark-user-read/${user.email}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadNotifyCount(0);
        } catch (err) {
          console.error("Error marking notifications read", err);
        }
      }
    };

    fetchUnreadCounts();
    markNotifsRead();

    if (user) {
      socket.connect();
      socket.emit("join_room", user._id);

      socket.on("receive_message", () => {
        if (location.pathname !== "/chat") {
          dispatch(incrementUnreadChatCount());
        }
      });

      socket.on("notification_update", () => {
        if (location.pathname !== "/notifications") {
          setUnreadNotifyCount(prev => prev + 1);
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

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = () => {
    if (window.innerWidth <= 1100) {
      setCategoryOpen(!categoryOpen);
    }
  };

  return (
    <>
      <div 
        className={`mobile-backdrop ${mobileMenuOpen ? "active" : ""}`} 
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      <nav className="navbar">
        <Link to="/" className="nav-left" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffd700, #b8860b)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 4 3 12h14l3-12-6 7-4-3-4 3-6-7z" />
              <circle cx="12" cy="9" r="2" />
            </svg>
          </div>
          <span className="brand">Majestic Events</span>
        </Link>

        <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`bar ${mobileMenuOpen ? "active" : ""}`}></span>
          <span className={`bar ${mobileMenuOpen ? "active" : ""}`}></span>
          <span className={`bar ${mobileMenuOpen ? "active" : ""}`}></span>
        </div>

        <div className={`nav-center ${mobileMenuOpen ? "mobile-active" : ""}`}>
          <Link to='/' onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <div 
            className="nav-item dropdown" 
            onMouseEnter={() => window.innerWidth > 1100 && setCategoryOpen(true)} 
            onMouseLeave={() => window.innerWidth > 1100 && setCategoryOpen(false)}
            onClick={handleCategoryClick}
          >
            <span className="dropdown-trigger">
              Categories 
              <span className={`dropdown-arrow ${categoryOpen ? "rotate" : ""}`}>▼</span>
            </span>
            <div className={`nav-dropdown ${categoryOpen ? "show" : ""}`}>
              {categories && categories.length > 0 ? (
                <>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/category/${cat._id}`}
                      className="nav-dropdown-item"
                      onClick={() => { setMobileMenuOpen(false); setCategoryOpen(false); }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="dropdown-divider" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                  <Link
                    to="/category"
                    className="nav-dropdown-item view-all-link"
                    style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                    onClick={() => { setMobileMenuOpen(false); setCategoryOpen(false); }}
                  >
                    View All Categories
                  </Link>
                </>
              ) : (
                <span className="nav-dropdown-item">No Categories</span>
              )}
            </div>
          </div>
          <Link to='/about' onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to='/services' onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to='/contact' onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>

        <div className="nav-right" ref={dropdownRef}>
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginRight: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            {theme === "dark" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="nav-user-name">{user.name}</Link>
              <img
                src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE_URL}/${user.profileImage.replace(/\\/g, "/")}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                className="profile-icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                alt="Profile"
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
            </>
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              className="profile-icon"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              alt="Profile"
              onError={(e) => {
                e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              }}
            />
          )}

          <div className="nav-arrow-wrapper" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <span className={`arrow ${userMenuOpen ? "rotate" : ""}`}>▼</span>
            {(unreadChatCount > 0 || unreadNotifyCount > 0) && <span className="arrow-badge-dot"></span>}
          </div>

          <div className={`nav-dropdown ${userMenuOpen ? "show" : ""}`}>
            {!user ? (
              <>
                <Link className="nav-dropdown-item" to='/login' onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }}>Login</Link>
                <Link className="nav-dropdown-item" to='/register' onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }}>Register</Link>
              </>
            ) : (
              <>
                <div className="user-email-display" style={{ padding: '10px', fontSize: '0.8rem', color: '#666', borderBottom: '1px solid #eee' }}>{user.email}</div>
                <Link to='/profile' className="nav-dropdown-item" onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }}>My Profile</Link>
                {user.role === "Admin" && (
                  <Link to='/admin/dashboard' className="nav-dropdown-item" onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }}>Admin Dashboard</Link>
                )}
                <Link to='/notifications' className="nav-dropdown-item" onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Notifications
                  {unreadNotifyCount > 0 && location.pathname !== "/notifications" && <span className="unread-badge-navbar">{unreadNotifyCount}</span>}
                </Link>
                <div 
                  className="nav-dropdown-item review-trigger-item" 
                  onClick={() => {
                    const bc = new BroadcastChannel('review_trigger');
                    bc.postMessage('OPEN_WEB_REVIEW');
                    bc.close();
                    setUserMenuOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}
                >
                  <i className="fas fa-star" style={{ fontSize: '0.8rem' }}></i>
                  Rate Our Website
                </div>
                <button className="nav-dropdown-item logout-btn" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
