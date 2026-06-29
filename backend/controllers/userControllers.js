import crypto from "crypto";
import asyncHandler from "express-async-handler";
import generateToken from "../config/generateToken.js";
import User from "../models/userModel.js";

const createAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id),
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 50;
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;

// @description    Get or Search all users
// @route          GET /api/user?search=
// @access         Private (requires auth)
const allUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();

  if (!search) {
    return res.json([]);
  }

  const safeSearch = escapeRegex(search);
  const startsWithName = new RegExp(`^${safeSearch}`, "i");
  const containsText = new RegExp(safeSearch, "i");

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: req.user._id },
        $or: [{ name: containsText }, { email: containsText }],
      },
    },
    {
      $addFields: {
        searchRank: {
          $cond: [{ $regexMatch: { input: "$name", regex: startsWithName } }, 0, 1],
        },
      },
    },
    { $sort: { searchRank: 1, name: 1 } },
    { $limit: 8 },
    { $project: { password: 0, searchRank: 0, __v: 0 } },
  ]);

  res.send(users);
});

// @description    Register new user
// @route          POST /api/user/
// @access         Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = name?.trim();

  if (!normalizedName || !email?.trim() || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > MAX_EMAIL_LENGTH ||
    !isValidEmail(normalizedEmail)
  ) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  if (normalizedName.length > MAX_NAME_LENGTH) {
    res.status(400);
    throw new Error(`Name must be ${MAX_NAME_LENGTH} characters or fewer`);
  }

  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    res.status(400);
    throw new Error(
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    );
  }

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password,
  });

  if (user) {
    res.status(201).json(createAuthResponse(user));
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// @description    Authenticate user
// @route          POST /api/user/login
// @access         Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  if (
    normalizedEmail.length > MAX_EMAIL_LENGTH ||
    !isValidEmail(normalizedEmail)
  ) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    res.json(createAuthResponse(user));
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @description    Create or authenticate demo guest user
// @route          POST /api/user/guest
// @access         Public
const guestUser = asyncHandler(async (req, res) => {
  const guestEmail = (process.env.GUEST_EMAIL || "guest@example.com").trim().toLowerCase();
  const guestName = process.env.GUEST_NAME || "Guest User";

  let user = await User.findOne({ email: guestEmail });

  if (!user) {
    user = await User.create({
      name: guestName,
      email: guestEmail,
      password: process.env.GUEST_PASSWORD || crypto.randomBytes(32).toString("hex"),
    });
  }

  res.json(createAuthResponse(user));
});

export { allUsers, authUser, guestUser, registerUser };
