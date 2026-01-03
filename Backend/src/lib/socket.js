import { Server } from "socket.io";

const userSocketMap = {}; // { userId: socketId }
let io; // 👈 module-scoped variable

export const getReceiverId = (userId) => {
  return userSocketMap[userId];
};

// 👇 getter for io
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;
    console.log("Handshake query:", socket.handshake.query);

    if (userId) userSocketMap[userId] = socket.id;
    console.log("🧩 userSocketMap:", userSocketMap);

    //emit is used to send events to all the connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

export default setupSocket;
