import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (baseURL.includes("localhost") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
  baseURL = baseURL.replace("localhost", window.location.hostname);
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
