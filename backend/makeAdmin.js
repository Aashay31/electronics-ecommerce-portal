require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Update the first user found to be an admin
    const user = await User.findOneAndUpdate(
      {}, 
      { role: "admin" },
      { new: true, sort: { createdAt: 1 } }
    );

    if (user) {
      console.log(`\nSUCCESS! User updated to admin:`);
      console.log(`Name: ${user.fullName}`);
      console.log(`Email: ${user.email}`);
      console.log(`\nYou can now log in with this email to access the Admin Dashboard.\n`);
    } else {
      console.log("No users found in the database. Please create an account first.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
