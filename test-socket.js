const { io } = require("socket.io-client");
const axios = require("axios");

async function test() {
  try {
    // 1. Log in as admin
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@electromart.com", // Assuming this is an admin email, we can check DB if needed
      password: "admin" // Assuming password
    });
    
    const token = res.data.token;
    console.log("Logged in successfully. Token:", token.substring(0, 20) + "...");
    
    // 2. Connect socket
    const socket = io("http://localhost:5000", {
      auth: { token }
    });
    
    socket.on("connect", () => {
      console.log("Socket connected!");
      socket.emit("join:admin");
      console.log("Requested join:admin");
      
      // Wait a bit, then emit an order status update to test if we get it
      // Actually we can't emit to admin room from client, only server can
    });
    
    socket.on("dashboard:statsUpdated", (stats) => {
      console.log("Received dashboard:statsUpdated!", stats);
    });
    
    socket.on("error", (err) => {
      console.log("Socket Error Event:", err);
    });
    
    socket.on("connect_error", (err) => {
      console.log("Socket Connect Error:", err.message);
    });
    
    setTimeout(() => {
      socket.disconnect();
      console.log("Done testing");
    }, 5000);
    
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
