const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

/**
 * Attach a Socket.io server to the given HTTP server instance.
 * Must be called once during startup (from server.js).
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://192.168.1.7:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.use((socket, next) => {
    // Try to get token from auth object, or try to parse from cookie
    let token = socket.handshake.auth.token;
    if (!token && socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/(?:^|; )token=([^;]*)/);
      if (match) {
        token = match[1];
      }
    }
    
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require("./models/User");
      User.findById(decoded.id).lean().then(user => {
        if (!user) {
          return next(new Error("User not found"));
        }
        if (user.isBanned) {
          return next(new Error("User is banned"));
        }
        socket.user = user;
        next();
      }).catch(err => {
        console.error("Socket user fetch error:", err);
        next(new Error("Database error during socket auth"));
      });
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id, socket.user?.email);
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Authenticated users join their personal room
    socket.on("join", (userId) => {
      const socketUserId = socket.user.id || String(socket.user._id);
      if (!socket.user || socketUserId !== userId) {
        socket.emit("error", { 
          message: "Unauthorized room join attempt" 
        });
        return;
      }
      
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] ${socket.id} joined room user:${userId}`);
      }
    });

    // Admin users join the admin room
    socket.on("join:admin", () => {
      console.log("join:admin called. socket.user:", socket.user);
      if (!socket.user || socket.user.role !== "admin") {
        socket.emit("error", { 
          message: "Admin access required" 
        });
        return;
      }

      socket.join("admin");
      console.log(`[Socket] ${socket.id} joined room admin`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Return the initialised Socket.io server instance.
 * Throws if called before initSocket().
 */
function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialised — call initSocket() first");
  }
  return io;
}

module.exports = { initSocket, getIO };
