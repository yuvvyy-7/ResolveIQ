import { connectDB } from "../src/lib/db/connection";

async function testConnection() {
  console.log("Starting MongoDB connection test...");
  
  if (!process.env.MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is missing from environment variables.");
    console.log("Please ensure you have created a .env.local file with your MongoDB connection string.");
    process.exit(1);
  }

  try {
    const conn = await connectDB();
    console.log(`✅ SUCCESS: Connected to MongoDB Database: ${conn.name}`);
    console.log("The connection helper is working correctly.");
  } catch (error) {
    console.error("❌ ERROR: Failed to connect to MongoDB.");
    console.error("Details:", error);
  } finally {
    // Cleanly close the connection so the script can exit
    console.log("Closing connection...");
    const mongoose = require("mongoose");
    await mongoose.disconnect();
    console.log("Connection closed.");
    process.exit(0);
  }
}

testConnection();
