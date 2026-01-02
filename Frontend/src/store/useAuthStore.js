import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningIn: false,
  isLogginIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
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
    } catch (error) {
      console.log("signup error");
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningIn: false });
    }
  },

  login: async (data) => {
    set({ isLogginIn: true });
    try {
      const res = axiosInstance.post("/auth/login", data);

      set({ authUser: res.data });
      toast.success("Logged In Successfully");
    } catch (error) {
      console.log("login error");
      toast.error(error.response.data.message);
    } finally {
      set({ isLogginIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("error in logging out");
      toast.error(error.response.data.message);
    }
  },
}));
