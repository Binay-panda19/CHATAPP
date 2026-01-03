import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import { connectDB } from "./lib/DB.lib.js";
import { app } from "./app.js";
import { server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();
