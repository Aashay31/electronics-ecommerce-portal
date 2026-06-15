require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Promote ashayv0@gmail.com to admin and set all other users to standard user role
    await User.updateMany({ email: { $ne: "ashayv0@gmail.com" } }, { role: "user" });
    const user = await User.findOneAndUpdate(
      { email: "ashayv0@gmail.com" },
      { role: "admin" },
      { returnDocument: "after" }
    );

    if (user) {
      console.log(`\nSUCCESS! User updated to admin:`);
      console.log(`Name: ${user.fullName}`);
      console.log(`Email: ${user.email}`);
      console.log(`\nYou can now log in with this email to access the Admin Dashboard.\n`);
    } else {
      console.log("ashayv0@gmail.com not found in the database. Creating or choosing another user wasn't performed.");
    }

    const users = await User.find({}, "fullName email role");
    console.log("Current user list:");
    users.forEach(u => {
      console.log(`- ${u.fullName} (${u.email}): role=${u.role}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
