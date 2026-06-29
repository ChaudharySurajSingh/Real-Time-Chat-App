import dns from "dns";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
