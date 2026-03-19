import { Server } from 'socket.io';

export const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Map to track online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (data) => {
        const rawId = typeof data === 'string' ? data : data.userId;
        const userId = String(rawId);
        const email = typeof data === 'object' ? data.email : null;

        socket.join(userId);
        if (email) socket.join(email);

        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} ${email ? `(${email})` : ''} joined room and is online`);

        // Notify others that this user is online
        io.emit("user_status", { userId, status: "online" });

        // Send current online users to the user who just joined
        socket.emit("initial_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_message", async (data) => {
        const { receiverId, message, senderId, _id } = data;

        let status = "sent";
        if (onlineUsers.has(receiverId)) {
            status = "delivered";
        }

        // Emit message to receiver
        io.to(receiverId).emit("receive_message", { ...data, status });

        // If status is delivered, notify sender to update their UI tick
        if (status === "delivered") {
            io.to(senderId).emit("message_status_update", { messageId: _id, status: "delivered", receiverId });
        }
    });

    socket.on("mark_read", (data) => {
        const { senderId, receiverId } = data;
        // Notify the sender that their messages have been read (to blue tick)
        io.to(senderId).emit("message_status_update", { status: "read", receiverId });
        // Notify the receiver's other tabs that messages are read (to clear badges)
        io.to(receiverId).emit("message_status_update", { status: "read", senderId });
    });

    socket.on("edit_message", (data) => {
        const { messageId, receiverId, senderId, newMessage } = data;
        io.to(receiverId).emit("message_edited", { messageId, newMessage });
        if (senderId) io.to(senderId).emit("message_edited", { messageId, newMessage }); // Sync sender's tabs
    });

    socket.on("delete_message", (data) => {
        const { messageId, receiverId, senderId } = data;
        io.to(receiverId).emit("message_deleted", { messageId });
        if (senderId) io.to(senderId).emit("message_deleted", { messageId }); // Sync sender's tabs
    });

    socket.on("disconnect", () => {
        // Find and remove the user from onlineUsers
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit("user_status", { userId, status: "offline" });
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});
