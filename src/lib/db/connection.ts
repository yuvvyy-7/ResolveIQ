import mongoose from "mongoose";

/**
 * Global caching for the Mongoose connection.
 * 
 * In a Next.js environment, the development server hot-reloads files
 * when they are changed. Without caching the connection globally, every
 * hot-reload would create a new connection to the database. This quickly
 * exhausts the connection pool and crashes the app.
 * 
 * We use `global` to store the connection promise so it persists across
 * hot-reloads. In production, this simply ensures a singleton connection.
 */

// Define the global type for our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Initialize the global cache if it doesn't exist
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB using Mongoose.
 * 
 * @returns {Promise<mongoose.Connection>} The established Mongoose connection.
 * @throws {Error} If MONGODB_URI is not defined in the environment.
 */
export async function connectDB() {
  // If we already have a connection, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // Ensure the URI is provided
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // If a connection is already being established, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if not connected
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset the promise if connection fails
    throw e;
  }

  return cached.conn;
}
