import { createContext, useContext, useEffect } from "react";
import socket, { getTokenFromCookieOrStorage } from "../socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      socket.disconnect();
      return;
    }

    // Refresh token before connecting to avoid stale/wrong-user tokens
    socket.auth = { token: getTokenFromCookieOrStorage() };
    socket.connect();

    const joinRooms = () => {
      socket.emit("join", user._id);
      if (user.role === "admin") {
        socket.emit("join:admin");
      }
    };

    // Join immediately if already connected, or on connect event
    if (socket.connected) {
      joinRooms();
    }
    socket.on("connect", joinRooms);

    // Rejoin on reconnect
    socket.io.on("reconnect", joinRooms);

    // Error handling
    const handleConnectError = (err) => {
      if (err.message === "Authentication required" || err.message === "Invalid or expired token") {
        logout();
        socket.disconnect();
      }
    };

    const handleError = (err) => {
      console.error("Socket error:", err.message);
    };

    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", joinRooms);
      socket.io.off("reconnect", joinRooms);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
      socket.disconnect();
    };
  }, [isAuthenticated, user?._id, user?.role]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  return useContext(SocketContext);
}
