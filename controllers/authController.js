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
  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const email = payload.email ?? payload.userEmail ?? payload.username;
  const password = payload.password;

  console.log("[AUTH][LOGIN] Incoming payload keys:", Object.keys(payload));
  console.log("[AUTH][LOGIN] Email candidate:", email || "<missing>");

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
