import { create } from "zustand";
import { toast } from "react-hot-toast";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
  messages: [],
  users: [],

  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/msg/users");

      set({ users: res.data });
    } catch (error) {
      console.log("error in Get Users");
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/msg/${userId}`);

      set({ messages: res.data });
    } catch (error) {
      console.log("error in Get Messages");
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/msg/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.log("error in send message");
      toast.error(error.response.data.message || "something went wrong !!");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      console.log("📩 Received socket message:", newMessage);

      const { selectedUser } = get();

      if (
        newMessage.senderId !== selectedUser._id &&
        newMessage.receiverId !== selectedUser._id
      ) {
        return;
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
