import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, selectAdminUserData, selectAdminLoading } from '../../Features/Adminslice';
import { fetchAllMessages, selectMessages } from '../../Features/Contactslice';
import { fetchCategories, selectAllCategories } from '../../Features/Categoryslice';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const userData = useSelector(selectAdminUserData);
    const messages = useSelector(selectMessages);
    const categories = useSelector(selectAllCategories);
    const loading = useSelector(selectAdminLoading);

    useEffect(() => {
        // Initial fetch
        dispatch(fetchAllUsers());
        dispatch(fetchAllMessages());
        dispatch(fetchCategories());

        // Admin updates (users, messages)
        const bcAdmin = new BroadcastChannel('admin_updates');
        bcAdmin.onmessage = (event) => {
            if (event.data === 'REFRESH_DATA' || event.data.type === 'REFRESH_DATA' || event.data.type === 'USER_DELETED') {
                dispatch(fetchAllUsers({ isSilent: true }));
                dispatch(fetchAllMessages());
            }
        };

        // Category updates
        const bcCategory = new BroadcastChannel('category_updates');
        bcCategory.onmessage = (event) => {
            if (event.data === 'REFRESH_CATEGORIES') {
                dispatch(fetchCategories());
            }
        };

        return () => {
            bcAdmin.close();
            bcCategory.close();
        };
    }, [dispatch]);

    // Calculate stats
    const regularUsers = userData?.filter(u => u.role !== "Admin") || [];
    const totalUsers = regularUsers.length;
    const totalAdmins = userData?.filter(u => u.role === "Admin").length || 0;
    const verifiedUsers = regularUsers.filter(u => u.verifyuser).length;
    const pendingVerifications = regularUsers.filter(u => !u.verifyuser).length;



    // Get last 5 registered users
    const recentUsers = [...regularUsers]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="admin-dashboard-content">
            <div className="dashboard-header-section">
                <div>
                    <h1 className="dashboard-title">Majestic Executive Hub</h1>
                    <p className="welcome-text">Orchestrating excellence in every celebration.</p>
                </div>
                <div className="live-status-badge">
                    <span className="pulse-dot"></span>
                    Operational - Real-time Data
                </div>
            </div>

            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users-icon">✨</div>
                    <div className="stat-info">
                        <h3>Clientèle</h3>
                        <p>{loading ? "..." : totalUsers}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon admins-icon">🎩</div>
                    <div className="stat-info">
                        <h3>Concierges</h3>
                        <p>{loading ? "..." : totalAdmins}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon verified-icon">💎</div>
                    <div className="stat-info">
                        <h3>Majestic Guests</h3>
                        <p>{loading ? "..." : verifiedUsers}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending-icon">⏳</div>
                    <div className="stat-info">
                        <h3>Pending Inquiries</h3>
                        <p>{loading ? "..." : pendingVerifications}</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => window.location.href = '/admin/category'} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon category-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>📂</div>
                    <div className="stat-info">
                        <h3>Event Types</h3>
                        <p>{loading ? "..." : (categories?.length || 0)}</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => window.location.href = '/admin/messages'} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon message-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>✉️</div>
                    <div className="stat-info">
                        <h3>Inquiries</h3>
                        <p>{loading ? "..." : messages.length}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="recent-activity-section">
                    <div className="section-header">
                        <h2>Recent Registrations</h2>
                        <button className="view-all-btn" onClick={() => window.location.href = '/admin/users'}>Manage All</button>
                    </div>
                    <div className="activity-list">
                        {recentUsers.length > 0 ? (
                            recentUsers.map(user => (
                                <div key={user._id} className="activity-item">
                                    <div className="user-avatar-mini">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-details-mini">
                                        <span className="user-name-mini">{user.name}</span>
                                        <span className="user-email-mini">{user.email}</span>
                                    </div>
                                    <span className="time-ago">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No new members found.</p>
                        )}
                    </div>
                </div>

                <div className="quick-actions-section">
                    <h2>Master Controls</h2>
                    <div className="actions-grid">
                        <div className="action-button-card" onClick={() => window.location.href = '/admin/users'}>
                            <div className="action-icon">👥</div>
                            <span>Clients</span>
                        </div>
                        <div className="action-button-card" onClick={() => window.location.href = '/admin/category'}>
                            <div className="action-icon">📁</div>
                            <span>Services</span>
                        </div>
                        <div className="action-button-card" onClick={() => window.location.href = '/admin/messages'}>
                            <div className="action-icon">📩</div>
                            <span>Messages</span>
                        </div>
                        <div className="action-button-card" onClick={() => window.location.href = '/admin/settings'}>
                            <div className="action-icon">⚙️</div>
                            <span>System</span>
                        </div>
                        <div className="action-button-card" onClick={() => window.location.href = '/admin/profile'}>
                            <div className="action-icon">👤</div>
                            <span>Admin</span>
                        </div>
                    </div>

                    <div className="system-health-card">
                        <h3>Infrastructure Status</h3>
                        <div className="health-bar-container">
                            <div className="health-bar" style={{ width: '99%' }}></div>
                        </div>
                        <div className="health-stats">
                            <span>Uptime: 99.9%</span>
                            <span>Response: 18ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
