import { io } from "socket.io-client";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (baseURL.includes("localhost") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
  baseURL = baseURL.replace("localhost", window.location.hostname);
}

export const getTokenFromCookieOrStorage = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? match[1] : null;
};

const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: getTokenFromCookieOrStorage(),
  },
});

export default socket;
