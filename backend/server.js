import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

export const getAllowedOrigins = () =>
  (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (
    !origin ||
    allowedOrigins.includes(origin) ||
    process.env.NODE_ENV !== "production"
  ) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use(notFound);
app.use(errorHandler);

export const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: getAllowedOrigins() },
  });

  io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
      if (!userData?._id) return;
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => socket.join(room));
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
      const chat = newMessageReceived.chat;

      if (!chat?.users) return;

      chat.users.forEach((chatUser) => {
        if (chatUser._id === newMessageReceived.sender._id) return;
        socket.in(chatUser._id).emit("message received", newMessageReceived);
      });
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.info(`Server running on port ${server.address().port}`);
      resolve(server);
    });
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  });
}

export { app };
