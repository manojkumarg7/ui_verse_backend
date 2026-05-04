const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/jwt");

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
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const match = await bcrypt.compare(String(password), user.password);
  if (!match) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id);
  return { user: toPublicUser(user), token };
}

module.exports = { registerUser, loginUser, toPublicUser };
