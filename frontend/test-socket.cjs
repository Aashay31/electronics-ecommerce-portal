const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMDU5NjllMzk2MTEzNjBjMjQzZjkxOSIsImlhdCI6MTc4MjEzMTM0N30.S-hwoW3Milt3LiKroeGZPHjmvkrEsSOZzKtkJip4DVQ";

const socket = io("http://localhost:5000", {
  auth: { token }
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  socket.emit("join:admin");
  console.log("Requested join:admin");
});

socket.on("order:created", (order) => {
  console.log("SUCCESS! Received order:created event!");
  console.log("Order ID:", order._id);
});

socket.on("error", (err) => {
  console.log("Socket Error Event:", err);
});

socket.on("connect_error", (err) => {
  console.log("Socket Connect Error:", err.message);
});

// Create a dummy order by hitting API? No, we just need to see if we get the event when the user places an order.
// Let's just hold the script open for 10 seconds and simulate a backend emit
console.log("Listening for events...");

setTimeout(() => {
  console.log("Done");
  process.exit(0);
}, 5000);
