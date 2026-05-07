const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/jwt");

function normalizeText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function toPublicUser(userDoc) {
  const o = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete o.password;
  return o;
}

async function registerUser({ name, email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError("Email already registered", 400);
  }

  const hashed = await bcrypt.hash(String(password), 10);
  let user;
  try {
    user = await User.create({
      name: name ? String(name).trim() : undefined,
      email: normalizedEmail,
      password: hashed,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("Email already registered", 400);
    }
    throw err;
  }

  const token = signToken(user._id);
  return { user: toPublicUser(user), token };
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeText(email).toLowerCase();
  const normalizedPassword = normalizeText(password);

  if (!normalizedEmail || !normalizedPassword) {
    throw new AppError("Missing required fields: email and password", 400);
  }

  console.log("[AUTH][LOGIN] Lookup user by email:", normalizedEmail);
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) {
    console.log("[AUTH][LOGIN] User not found for email:", normalizedEmail);
    throw new AppError("User not found", 404);
  }

  console.log("[AUTH][LOGIN] User found:", {
    id: String(user._id),
    email: user.email,
    hasPassword: Boolean(user.password),
  });

  if (!user.password || typeof user.password !== "string") {
    console.log("[AUTH][LOGIN] Stored password hash is missing/invalid");
    throw new AppError("Invalid password", 401);
  }

  const match = await bcrypt.compare(normalizedPassword, user.password);
  if (!match) {
    console.log("[AUTH][LOGIN] Password mismatch for:", normalizedEmail);
    throw new AppError("Invalid password", 401);
  }

  const token = signToken(user._id);
  console.log("[AUTH][LOGIN] Login successful for:", normalizedEmail);
  return { user: toPublicUser(user), token };
}

module.exports = { registerUser, loginUser, toPublicUser };
