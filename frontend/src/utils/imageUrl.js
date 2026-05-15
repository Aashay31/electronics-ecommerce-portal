/**
 * Resolves a product image URL.
 * - If the URL is a relative path (starts with /uploads/), prepend the API base URL.
 * - If the URL is an absolute URL (http/https), return as-is.
 * - Otherwise, return as-is (fallback).
 */
let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (API_URL.includes("localhost") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
  API_URL = API_URL.replace("localhost", window.location.hostname);
}

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("/uploads/")) {
    return `${API_URL}${imageUrl}`;
  }
  return imageUrl;
}
