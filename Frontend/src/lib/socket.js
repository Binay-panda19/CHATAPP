import { io } from "socket.io-client";

const BASE_URL = "https://chatapp-r9k3.onrender.com";

const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
