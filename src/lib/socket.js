import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

let socketInstance = null;

function emitUserRegistration(socket) {
  try {
    const stored = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
    if (stored.name || stored.email || stored.id || stored._id) {
      socket.emit("register-user", {
        userName: stored.name || "",
        userId: stored.id || stored._id || "",
        userEmail: stored.email || "",
      });
    }
  } catch {
    // ignore
  }
}

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(API, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      emitUserRegistration(socketInstance);
    });

    // Heartbeat re-registration every 4 seconds to ensure online status persists
    setInterval(() => {
      if (socketInstance && socketInstance.connected) {
        emitUserRegistration(socketInstance);
      }
    }, 4000);

    // Also register on window storage / auth events
    window.addEventListener("storage", () => emitUserRegistration(socketInstance));
    window.addEventListener("authChange", () => emitUserRegistration(socketInstance));
  }

  return socketInstance;
}

export function registerSocketUser(user) {
  const socket = getSocket();
  if (user) {
    socket.emit("register-user", {
      userName: user.name || "",
      userId: user.id || user._id || "",
      userEmail: user.email || "",
    });
  }
}

export function joinSocketChatRoom(roomId) {
  if (roomId) {
    const socket = getSocket();
    socket.emit("join-chat-room", roomId);
  }
}
