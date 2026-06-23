import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
const MESSAGE_LIMIT = 50;

const ensureValidObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${label}`);
    error.statusCode = 400;
    throw error;
  }
};

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  ensureValidObjectId(chatId, "chatId");

  const chat = await Chat.findOne({ _id: chatId, users: req.user._id }).select("_id");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name email")
    .populate("chat");

  res.json(messages);
});

//@description     Create New Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content?.trim() || !chatId) {
    res.status(400);
    throw new Error("Message content and chatId are required");
  }

  if (content.trim().length > MESSAGE_LIMIT) {
    res.status(400);
    throw new Error(`Message must be ${MESSAGE_LIMIT} characters or less`);
  }

  ensureValidObjectId(chatId, "chatId");

  const chat = await Chat.findOne({ _id: chatId, users: req.user._id }).select("_id");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  let message = await Message.create({
    sender: req.user._id,
    content: content.trim(),
    chat: chatId,
  });

  message = await Message.findById(message._id)
    .populate("sender", "name email")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name email" },
    });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  res.status(201).json(message);
});

export { allMessages, sendMessage };
