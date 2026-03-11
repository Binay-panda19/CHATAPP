import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chatapp-r9k3.onrender.com/api",
  withCredentials: true,
});
