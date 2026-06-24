import mongoose from "mongoose";
import dns from "dns";

// Force Node.js DNS resolver to use Google public DNS (8.8.8.8).
// Root cause: the local network DNS server (10.233.174.20) cannot resolve
// SRV records (_mongodb._tcp.*), causing ECONNREFUSED on mongodb+srv:// URIs.
// MongoDB Compass works because it has its own DNS stack that bypasses the OS resolver.
// Fix: point dns.setServers to a public resolver before mongoose.connect() is called.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    console.log(`   URI: ${process.env.MONGODB_URI?.replace(/:([^@]+)@/, ":<hidden>@")}`);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected`);
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State:    ${conn.connection.readyState === 1 ? "connected" : "unknown"}`);

    // Log collections on first connect
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections (${collections.length}): ${collections.map(c => c.name).join(", ") || "none yet"}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack:   ${error.stack}`);
    process.exit(1);
  }
};

export default connectDB;
