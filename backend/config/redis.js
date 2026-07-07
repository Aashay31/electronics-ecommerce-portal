const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Retry connection with max 3 seconds delay
    return Math.min(times * 100, 3000);
  },
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  // Log but never crash the app if Redis is down
  console.error("Redis connection error:", err.message);
});

module.exports = redis;
