import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectLoggedInUser } from "../../Features/Userslice";
import {
    fetchHistory,
    fetchInteractedUsers,
    selectMessages,
    selectInteractedUsers,
    addMessage,
    updateMessageInList,
    updateAllMessagesStatus,
    removeMessageFromList,
    markMessagesAsRead
} from "../../Features/Chatslice";
import axios from "axios";
import { socket } from "../../utils/socket";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./AdminChat.css";

const AdminChat = () => {
    const dispatch = useDispatch();
    const admin = useSelector(selectLoggedInUser);
    const users = useSelector(selectInteractedUsers);
    const messages = useSelector(selectMessages);

    const [selectedUser, setSelectedUser] = useState(null);
    const [input, setInput] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editInput, setEditInput] = useState("");
    const [onlineUserIds, setOnlineUserIds] = useState(new Set());
    const [showUsersList, setShowUsersList] = useState(true); // For mobile view toggle

    const chatEndRef = useRef(null);
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
        dispatch(fetchInteractedUsers());
    }, [dispatch]);

    useEffect(() => {
        if (admin) {
            socket.connect();

            socket.on("receive_message", (data) => {
                const senderIdStr = String(data.senderId);
                if (selectedUser && String(selectedUser._id) === senderIdStr) {
                    dispatch(addMessage({ ...data, sender: data.senderId, receiver: admin._id, timestamp: new Date() }));
                    socket.emit("mark_read", { senderId: data.senderId, receiverId: admin._id });
                    dispatch(markMessagesAsRead(data.senderId));
                } else {
                    dispatch(fetchInteractedUsers());
                }
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

            socket.on("user_status", (data) => {
                setOnlineUserIds((prev) => {
                    const next = new Set(prev);
                    if (data.status === "online") next.add(String(data.userId));
                    else next.delete(String(data.userId));
                    return next;
                });
            });

            socket.on("initial_online_users", (onlineIds) => {
                setOnlineUserIds(new Set(onlineIds.map(id => String(id))));
            });

            socket.emit("join_room", admin._id);

            return () => {
                socket.off("receive_message");
                socket.off("message_status_update");
                socket.off("message_edited");
                socket.off("message_deleted");
                socket.off("user_status");
                socket.off("initial_online_users");
                socket.disconnect();
            };
        }
    }, [admin, selectedUser, dispatch]);

    useEffect(() => {
        if (selectedUser) {
            dispatch(fetchHistory(selectedUser._id));
            dispatch(markMessagesAsRead(selectedUser._id));
            socket.emit("mark_read", { senderId: selectedUser._id, receiverId: admin._id });
        }
    }, [selectedUser, admin._id, dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);



    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedUser) return;

        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.post(`${API_BASE_URL}/chat/send`, {
                receiver: selectedUser._id,
                message: input
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const sentMsg = res.data.chat;
            socket.emit("send_message", { ...sentMsg, receiverId: selectedUser._id, senderId: admin._id });
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
            socket.emit("delete_message", { messageId: msgId, receiverId: selectedUser._id, senderId: admin._id });
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
            socket.emit("edit_message", { messageId: msgId, receiverId: selectedUser._id, senderId: admin._id, newMessage: editInput });
            dispatch(updateMessageInList({ messageId: msgId, newMessage: editInput }));
            setEditingMessage(null);
        } catch (err) {
            console.error("Error updating message", err);
        }
    };

    const renderTicks = (status) => {
        if (status === "sent") return <span className="status-tick">✓</span>;
        if (status === "delivered") return <span className="status-tick">✓✓</span>;
        if (status === "read") return <span className="status-tick read">✓✓</span>;
        return null;
    };

    return (
        <div className="admin-chat-container">
            <div className={`admin-chat-layout ${!showUsersList ? "chat-active" : ""}`} onClick={() => setActiveMenu(null)}>
                <div className={`users-list-panel ${showUsersList ? "mobile-visible" : ""}`}>
                    <div className="panel-header">
                        <h3>Recent Conversations</h3>
                    </div>
                    <div className="users-list">
                        {users.length === 0 ? (
                            <div className="no-users">No messages yet.</div>
                        ) : (
                            users.map((u) => (
                                <div
                                    key={u._id}
                                    className={`user-item ${selectedUser?._id === u._id ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedUser(u);
                                        setShowUsersList(false); // Hide list on mobile when user selected
                                    }}
                                >
                                    <div className="avatar-wrapper">
                                        <img
                                            src={u.profileImage ? (u.profileImage.startsWith('http') ? u.profileImage : `${API_BASE_URL}/${u.profileImage.replace(/\\/g, "/")}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt={u.name}
                                            className="user-avatar"
                                            onError={(e) => {
                                                e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                            }}
                                        />
                                        <span className={`online-indicator ${!onlineUserIds.has(String(u._id)) ? "offline" : ""}`}></span>
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{u.name}</div>
                                        <div className="user-email">{u.email}</div>
                                    </div>
                                    {u.unreadCount > 0 && (
                                        <div className="unread-badge">{u.unreadCount}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="chat-box-panel">
                    {selectedUser ? (
                        <>
                            <div className="panel-header chat-header">
                                <button className="mobile-back-btn" title="Back to users" onClick={() => setShowUsersList(true)}>
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <div className="header-user-info">
                                    <h3>{selectedUser.name}</h3>
                                    <span className={`status-text ${onlineUserIds.has(String(selectedUser._id)) ? "online" : "offline"}`}>
                                        {onlineUserIds.has(String(selectedUser._id)) ? "● Online" : "● Offline"}
                                    </span>
                                </div>
                            </div>
                            <div className="admin-chat-messages" ref={messagesContainerRef}>
                                {messages.map((msg, index) => (
                                    <div key={msg._id || index} className={`message-bubble ${msg.sender === admin._id ? "sent" : "received"}`}>
                                        {editingMessage === msg._id ? (
                                            <div className="edit-input-area">
                                                <input
                                                    className="edit-input"
                                                    value={editInput}
                                                    onChange={(e) => setEditInput(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="edit-actions">
                                                    <button className="edit-btn" onClick={() => setEditingMessage(null)}>Cancel</button>
                                                    <button className="edit-btn save" onClick={() => handleEditSave(msg._id)}>Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="message-content">{msg.message}</div>
                                                <div className="message-time">
                                                    {msg.edited && <span className="edited-label">Edited</span>}
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.sender === admin._id && renderTicks(msg.status)}
                                                </div>

                                                <button className="message-actions-trigger" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === msg._id ? null : msg._id);
                                                }}>⋮</button>

                                                {activeMenu === msg._id && (
                                                    <div className="message-actions-dropdown">
                                                        <div className="action-item" onClick={() => handleCopy(msg.message)}>Copy</div>
                                                        {msg.sender === admin._id && (
                                                            <>
                                                                <div className="action-item" onClick={() => handleEditStart(msg)}>Edit</div>
                                                                <div className="action-item delete" onClick={() => handleDelete(msg._id)}>Delete</div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form className="admin-chat-input-area" onSubmit={handleSend}>
                                <input
                                    className="chat-input"
                                    type="text"
                                    placeholder="Type a reply..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button className="chat-send-btn" type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <div className="select-user-prompt">
                            <div className="prompt-icon">💬</div>
                            <p>Select a user to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
