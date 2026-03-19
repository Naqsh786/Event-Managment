import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserNotifications, selectMessages, selectContactLoading } from "../Features/Contactslice";
import { selectLoggedInUser } from "../Features/Userslice";
import "./Notifications.css";

export default function Notifications() {
    const dispatch = useDispatch();
    const user = useSelector(selectLoggedInUser);
    const notifications = useSelector(selectMessages);
    const loading = useSelector(selectContactLoading);

    useEffect(() => {
        if (user && user.email) {
            dispatch(fetchUserNotifications(user.email));
        }
    }, [dispatch, user]);

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div className="notifications-container">
            <div className="notifications-card">
                <h1>My Notifications</h1>
                <p>Track the status of your contact form submissions.</p>

                <div className="notifications-list">
                    {/* System Notifications (Promotion, etc.) */}
                    {user && user.notifications && user.notifications.length > 0 && (
                        user.notifications.slice().reverse().map((notif, index) => (
                            <div key={`sys-${index}`} className="notification-item approved system-notif">
                                <div className="notif-header">
                                    <span className="notif-date">
                                        {new Date(notif.date).toLocaleDateString()}
                                    </span>
                                    <span className="status-badge approved">SYSTEM</span>
                                </div>
                                <div className="notif-body">
                                    <p>{notif.message}</p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Contact Form Notifications */}
                    {notifications && notifications.length > 0 ? (
                        notifications.map((item) => (
                            <div key={item._id} className={`notification-item ${item.status}`}>
                                <div className="notif-header">
                                    <span className="notif-date">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className={`status-badge ${item.status}`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="notif-body">
                                    <p><strong>Message:</strong> {item.message}</p>
                                    <p className="notif-feedback">
                                        {item.status === 'approved' && "✅ Your enquiry has been approved. Our team will contact you soon."}
                                        {item.status === 'rejected' && "❌ Your enquiry was rejected. Please try again or provide more details."}
                                        {item.status === 'pending' && "⏳ Your enquiry is currently under review."}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        (!user || !user.notifications || user.notifications.length === 0) && (
                            <div className="empty-notifications">
                                <div className="empty-icon">🔔</div>
                                <h3>No notifications yet</h3>
                                <p>You don't have any updates at the moment.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
