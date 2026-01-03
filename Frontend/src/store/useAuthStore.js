import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import socket from "../lib/socket";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningIn: false,
  isLogginIn: false,
  isUpdatingProfile: false,

  socket: null,
  onlineUsers: [],

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("error in checkAuth", error.message);

      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningIn: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("SignUp successful");
      get().connectSocket();
    } catch (error) {
      console.log("signup error");
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningIn: false });
    }
  },

  login: async (data) => {
    set({ isLogginIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged In Successfully");
      get().connectSocket();
    } catch (error) {
      console.log("login error");
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLogginIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log("error in logging out");
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },
  updateProfile: async (pic) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update", pic);
      set({ authUser: res.data });
      toast.success("Profile Pic updated");
    } catch (error) {
      console.log("error in uploading image");
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    if (socket.connected) return; // 👈 critical

    socket.io.opts.query = {
      userId: authUser._id,
    };

    socket.connect();

    set({ socket });

    socket.off("getOnlineUsers"); // 👈 PREVENT DUPLICATES
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
