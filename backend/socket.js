const { Server } = require("socket.io");

let io = null;

/**
 * Attach a Socket.io server to the given HTTP server instance.
 * Must be called once during startup (from server.js).
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Authenticated users join their personal room
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] ${socket.id} joined room user:${userId}`);
      }
    });

    // Admin users join the admin room
    socket.on("join:admin", () => {
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
