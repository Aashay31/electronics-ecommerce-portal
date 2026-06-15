import { io } from "socket.io-client";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (baseURL.includes("localhost") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
  baseURL = baseURL.replace("localhost", window.location.hostname);
}

const socket = io(baseURL, {
  autoConnect: false,
});

export default socket;
