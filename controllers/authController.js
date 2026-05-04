const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

/** Creates a new user in the database (hashed password). */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password });
  res.status(201).json({ success: true, user, token });
});

/** Authenticates an existing user; does not create a new row. */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });
  res.status(200).json({ success: true, user, token });
});

/** Current user (requires `Authorization: Bearer <jwt>`). */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: authService.toPublicUser(req.user),
  });
});

module.exports = { register, login, getMe };
