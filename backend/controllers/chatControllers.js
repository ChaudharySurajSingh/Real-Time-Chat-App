import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

const populateChat = (query) =>
  query
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name email" },
    });

const ensureValidObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${label}`);
    error.statusCode = 400;
    throw error;
  }
};

const ensureGroupAdmin = (chat, userId) => {
  if (!chat.groupAdmin || chat.groupAdmin.toString() !== userId.toString()) {
    const error = new Error("Only group admins can perform this action");
    error.statusCode = 403;
    throw error;
  }
};

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  ensureValidObjectId(userId, "userId");

  if (userId === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot create a chat with yourself");
  }

  const targetUser = await User.findById(userId).select("_id");

  if (!targetUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const existingChat = await populateChat(
    Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
  );

  if (existingChat) {
    return res.json(existingChat);
  }

  const createdChat = await Chat.create({
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  const fullChat = await Chat.findById(createdChat._id).populate("users", "-password");
  res.status(201).json(fullChat);
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  const chats = await populateChat(
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).sort({
      updatedAt: -1,
    })
  );

  res.status(200).json(chats);
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  const { users: usersJson, name } = req.body;

  if (!usersJson || !name) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  let users;
  try {
    users = JSON.parse(usersJson);
  } catch (error) {
    res.status(400);
    throw new Error("Invalid users payload");
  }

  if (!Array.isArray(users) || users.length < 2) {
    res.status(400);
    throw new Error("At least 2 other users are required to form a group chat");
  }

  users.forEach((id) => ensureValidObjectId(id, "userId"));
  users = [...new Set([...users, req.user._id.toString()])];

  const groupChat = await Chat.create({
    chatName: name.trim(),
    users,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(201).json(fullGroupChat);
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  ensureValidObjectId(chatId, "chatId");

  if (!chatName?.trim()) {
    res.status(400);
    throw new Error("Chat name is required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  ensureGroupAdmin(chat, req.user._id);

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName.trim() },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  ensureValidObjectId(chatId, "chatId");
  ensureValidObjectId(userId, "userId");

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  if (userId !== req.user._id.toString()) {
    ensureGroupAdmin(chat, req.user._id);
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(removed);
});

// @desc    Add user to Group
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  ensureValidObjectId(chatId, "chatId");
  ensureValidObjectId(userId, "userId");

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  ensureGroupAdmin(chat, req.user._id);

  if (chat.users.some((id) => id.toString() === userId)) {
    res.status(400);
    throw new Error("User is already in the group");
  }

  const userToAdd = await User.findById(userId).select("_id");

  if (!userToAdd) {
    res.status(404);
    throw new Error("User not found");
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(added);
});

export {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChats,
  removeFromGroup,
  renameGroup,
};
