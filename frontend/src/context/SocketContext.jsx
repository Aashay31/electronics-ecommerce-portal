import { createContext, useContext, useEffect } from "react";
import socket from "../socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      socket.disconnect();
      return;
    }

    // Connect and join personal room
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

    return () => {
      socket.off("connect", joinRooms);
      socket.io.off("reconnect", joinRooms);
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
