const mongoose = require("mongoose");

function logMongoState() {
  const conn = mongoose.connection;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const state = states[conn.readyState] ?? String(conn.readyState);
  console.log(`[MongoDB] readyState: ${state} (${conn.readyState})`);
}

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment");
  }

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] disconnected");
  });

  console.log("[MongoDB] connecting…");
  await mongoose.connect(uri);

  const { name, host } = mongoose.connection;
  console.log("[MongoDB] connected successfully");
  console.log(`[MongoDB] database name: ${name}`);
  if (host) {
    console.log(`[MongoDB] host: ${host}`);
  }
  logMongoState();
}

module.exports = { connectDB };
