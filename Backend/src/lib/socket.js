import { Server } from "socket.io";

let io;

const userSocketMap = {};

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) return;

    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }

    userSocketMap[userId].add(socket.id);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // console.log("🧩 userSocketMap:", userSocketMap);

    socket.on("disconnect", () => {
      userSocketMap[userId]?.delete(socket.id);
      if (userSocketMap[userId]?.size === 0) {
        delete userSocketMap[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  // console.log("🟢 Socket.IO initialized");
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const getReceiverSocketIds = (userId) => {
  return userSocketMap[userId] || [];
};
