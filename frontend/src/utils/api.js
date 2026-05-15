import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (baseURL.includes("localhost") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
  baseURL = baseURL.replace("localhost", window.location.hostname);
}

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
