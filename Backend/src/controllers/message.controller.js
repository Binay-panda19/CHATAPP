import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketIds, getIO } from "../lib/socket.js";
import Group from "../models/group.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const fetchUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    res.status(200).json(fetchUsers, { message: "The users are fetched" });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatType, chatId } = req.params;

    if (!chatType || !["dm", "group"].includes(chatType)) {
      return res.status(400).json({ message: "Invalid chat type" });
    }

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    let query = {};

    // DM messages
    if (chatType === "dm") {
      query = {
        messageType: "dm",
        $or: [
          { senderId: userId, receiverId: chatId },
          { senderId: chatId, receiverId: userId },
        ],
      };
    }

    //group messages
    if (chatType === "group") {
      query = {
        messageType: "group",
        groupId: chatId,
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 }) // oldest → newest
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { chatType, receiverId, groupId, text, image } = req.body;
    // const { id: receiverId } = req.params;
    const senderId = req.user.id;

    if (!chatType || !["dm", "group"].includes(chatType)) {
      return res.status(400).json({ message: "Invalid chat type" });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (chatType === "dm" && !receiverId) {
      return res.status(400).json({ message: "receiverId is required for DM" });
    }

    if (chatType === "group" && !groupId) {
      return res.status(400).json({ message: "groupId is required for group" });
    }

    let imageURl;

    if (image) {
      //upload image to cloudinary
      const uploadResponce = await cloudinary.uploader.upload(image);
      imageURl = uploadResponce.secure_url;
    }

    const message = await Message.create({
      senderId,
      receiverId: chatType === "dm" ? receiverId : null,
      groupId: chatType === "group" ? groupId : null,
      text,
      image,
      messageType: chatType,
    });

    //update group last msg

    if (chatType === "group") {
      await Group.findByIdAndUpdate(groupId, {
        lastMessage: message._id,
      });
    }

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    //todo: real time send functionality
    // const socketIds = getReceiverSocketIds(receiverId);

    // socketIds.forEach((id) => {
    //   getIO().to(id).emit("newMessage", newMessage);
    // });
    // res.status(201).json(newMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
