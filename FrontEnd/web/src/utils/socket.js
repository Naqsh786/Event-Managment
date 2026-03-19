import { io } from "socket.io-client";
import { SOCKET_URL } from "./apiConfig.js";

const isProduction = window.location.hostname !== "localhost";

// Uses the automatically detected or production URL
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["polling", "websocket"],
    // Effectively disable socket on production because Vercel doesn't support persistent servers
    reconnection: !isProduction
});

// Helper to only connect if not in production or if explicitly forced
export const connectSocket = (userId) => {
    if (isProduction) {
        console.warn("Socket.io is disabled in production due to Vercel limitations.");
        return;
    }
    if (!socket.connected) {
        socket.connect();
        socket.emit("join_room", userId);
    }
};
