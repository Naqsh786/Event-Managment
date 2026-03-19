import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectLoggedInUser } from "../Features/Userslice";
import {
    fetchHistory,
    getAdminIdAction,
    selectMessages,
    selectAdminId,
    addMessage,
    updateMessageInList,
    updateAllMessagesStatus,
    removeMessageFromList,
    markMessagesAsRead,
    setUnreadChatCount,
    selectUnreadChatCount
} from "../Features/Chatslice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../utils/socket";
import { API_BASE_URL } from "../utils/apiConfig";
import "./FloatingChat.css";

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectLoggedInUser);
    const messages = useSelector(selectMessages);
    const adminId = useSelector(selectAdminId);
    const unreadCount = useSelector(selectUnreadChatCount);

    const [input, setInput] = useState("");
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editInput, setEditInput] = useState("");
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        if (user && !adminId) {
            dispatch(getAdminIdAction());
        }
    }, [user, adminId, dispatch]);

    useEffect(() => {
        if (user && adminId) {
            if (isOpen) {
                dispatch(fetchHistory(adminId));
                dispatch(markMessagesAsRead(adminId));
                socket.emit("mark_read", { senderId: adminId, receiverId: user._id });
                dispatch(setUnreadChatCount(0));
            }

            socket.connect();

            socket.on("receive_message", (data) => {
                if (String(data.senderId) === String(adminId)) {
                    dispatch(addMessage({ ...data, sender: data.senderId, receiver: user._id, timestamp: new Date() }));
                    if (isOpen) {
                        socket.emit("mark_read", { senderId: adminId, receiverId: user._id });
                        dispatch(markMessagesAsRead(adminId));
                    }
                }
            });

            socket.on("user_status", (data) => {
                if (String(data.userId) === String(adminId)) {
                    setIsAdminOnline(data.status === "online");
                }
            });

            socket.on("initial_online_users", (onlineIds) => {
                const isAdmin = onlineIds.some(id => String(id) === String(adminId));
                setIsAdminOnline(isAdmin);
            });

            socket.on("message_status_update", (data) => {
                if (data.messageId) {
                    dispatch(updateMessageInList({ messageId: data.messageId, status: data.status }));
                } else {
                    dispatch(updateAllMessagesStatus({ status: data.status, receiverId: data.receiverId }));
                }
            });

            socket.on("message_edited", (data) => {
                dispatch(updateMessageInList({ messageId: data.messageId, newMessage: data.newMessage }));
            });

            socket.on("message_deleted", (data) => {
                dispatch(removeMessageFromList({ messageId: data.messageId }));
            });

            socket.emit("join_room", user._id);

            return () => {
                socket.off("receive_message");
                socket.off("user_status");
                socket.off("initial_online_users");
                socket.off("message_status_update");
                socket.off("message_edited");
                socket.off("message_deleted");
            };
        }
    }, [user, adminId, dispatch, isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !adminId) return;

        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.post(`${API_BASE_URL}/chat/send`, {
                receiver: adminId,
                message: input
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const sentMsg = res.data.chat;
            socket.emit("send_message", { ...sentMsg, receiverId: adminId, senderId: user._id });
            dispatch(addMessage(sentMsg));
            setInput("");
        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setActiveMenu(null);
    };

    const handleDelete = async (msgId) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/chat/delete/${msgId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            socket.emit("delete_message", { messageId: msgId, receiverId: adminId, senderId: user._id });
            dispatch(removeMessageFromList({ messageId: msgId }));
            setActiveMenu(null);
        } catch (err) {
            console.error("Error deleting message", err);
        }
    };

    const handleEditStart = (msg) => {
        setEditingMessage(msg._id);
        setEditInput(msg.message);
        setActiveMenu(null);
    };

    const handleEditSave = async (msgId) => {
        if (!editInput.trim()) return;
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/chat/update/${msgId}`, { message: editInput }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            socket.emit("edit_message", { messageId: msgId, receiverId: adminId, senderId: user._id, newMessage: editInput });
            dispatch(updateMessageInList({ messageId: msgId, newMessage: editInput }));
            setEditingMessage(null);
        } catch (err) {
            console.error("Error updating message", err);
        }
    };

    if (user && user.role === "Admin") return null;

    return (
        <div className={`floating-chat-wrapper ${isOpen ? "active" : ""}`}>
            {/* Chat Overlay Window */}
            <div className="chat-window">
                <div className="chat-window-header">
                    <div className="header-info">
                        <div className="admin-status">
                            <span className={`status-dot ${!isAdminOnline ? "offline" : ""}`}></span>
                        </div>
                        <div>
                            <h4>Admin Support</h4>
                            <p>{isAdminOnline ? "Online" : "Away"}</p>
                        </div>
                    </div>
                    <button className="close-chat" onClick={() => setIsOpen(false)}>×</button>
                </div>

                {!user ? (
                    <div className="login-required-view">
                        <div className="lock-icon">🔒</div>
                        <h3>Login Required</h3>
                        <p>Please login to chat with our Majestic Support team.</p>
                        <button className="chat-login-btn" onClick={() => {
                            setIsOpen(false);
                            navigate("/login");
                        }}>
                            Login Now
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="chat-messages" ref={messagesContainerRef} onClick={() => setActiveMenu(null)}>
                            {messages.length === 0 ? (
                                <div className="empty-chat-msg">
                                    <i className="fas fa-comment-dots"></i>
                                    <p>How can we help you today?</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={msg._id || index} className={`msg-bubble ${msg.sender === user._id ? "me" : "them"}`}>
                                        {editingMessage === msg._id ? (
                                            <div className="edit-area">
                                                <input
                                                    className="edit-input"
                                                    value={editInput}
                                                    onChange={(e) => setEditInput(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="edit-btns">
                                                    <button onClick={() => setEditingMessage(null)}>Cancel</button>
                                                    <button className="save" onClick={() => handleEditSave(msg._id)}>Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="msg-text">{msg.message}</div>
                                                <div className="msg-meta">
                                                    {msg.edited && <span className="edited-badge">Edited</span>}
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.sender === user._id && (
                                                        <span className={`status-tick ${msg.status}`}>
                                                            {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 3-Dot Menu */}
                                                <button className="msg-options-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === msg._id ? null : msg._id);
                                                }}>⋮</button>

                                                {activeMenu === msg._id && (
                                                    <div className="msg-options-dropdown">
                                                        <div className="option-item" onClick={() => handleCopy(msg.message)}>Copy</div>
                                                        {msg.sender === user._id && (
                                                            <>
                                                                <div className="option-item" onClick={() => handleEditStart(msg)}>Edit</div>
                                                                <div className="option-item delete" onClick={() => handleDelete(msg._id)}>Delete</div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <form className="chat-input-form" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Write a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" disabled={!input.trim()}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Floating Toggle Button */}
            <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                    <span className="close-icon">×</span>
                ) : (
                    <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {user && unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
                    </>
                )}
            </button>
        </div>
    );
};

export default FloatingChat;

