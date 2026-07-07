const redis = require("../config/redis");

// TTL constants (in seconds)
const TTL = {
  PRODUCTS_LIST: 300,    // 5 minutes
  PRODUCT_DETAIL: 600,   // 10 minutes
  HOMEPAGE: 300,         // 5 minutes
  CATEGORIES: 3600,      // 1 hour
  CHAT_RESPONSE: 900,    // 15 minutes
};

// Get from cache
async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis get error:", err.message);
    return null; // Fall back to DB on error
  }
}

// Set cache with TTL
async function setCache(key, data, ttl) {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error("Redis set error:", err.message);
    // Silently fail — app still works without cache
  }
}

// Delete specific cache key
async function deleteCache(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis delete error:", err.message);
  }
}

// Delete all keys matching a pattern
async function deleteCachePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error("Redis pattern delete error:", err.message);
  }
}

module.exports = { getCache, setCache, deleteCache, deleteCachePattern, TTL };
