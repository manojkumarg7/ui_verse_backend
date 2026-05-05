const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Presenter = require("../models/presenter.model");

function isValidImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function assertPresenterFields(body) {
  const { name, title, image } = body;
  const parts = [];

  if (name === undefined || name === null || !String(name).trim()) {
    parts.push("name is required");
  }
  if (title === undefined || title === null || !String(title).trim()) {
    parts.push("title is required");
  }
  if (image === undefined || image === null || !String(image).trim()) {
    parts.push("image is required");
  } else if (!isValidImageUrl(image)) {
    parts.push("image must be a valid http or https URL");
  }

  if (parts.length) {
    throw new AppError(parts.join("; "), 400);
  }
}

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid presenter id", 400);
  }
}

/** POST /api/presenters */
const createPresenter = asyncHandler(async (req, res) => {
  assertPresenterFields(req.body);
  const doc = await Presenter.create({
    name: String(req.body.name).trim(),
    title: String(req.body.title).trim(),
    image: String(req.body.image).trim(),
  });
  res.status(201).json({
    success: true,
    message: "Presenter created successfully",
    data: doc,
  });
});

/** GET /api/presenters */
const getPresenters = asyncHandler(async (_req, res) => {
  const data = await Presenter.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    message: "Presenters retrieved successfully",
    data,
  });
});

/** GET /api/presenters/:id */
const getPresenterById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);
  const data = await Presenter.findById(id).lean();
  if (!data) {
    throw new AppError("Presenter not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Presenter retrieved successfully",
    data,
  });
});

/** PUT /api/presenters/:id */
const updatePresenter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);
  assertPresenterFields(req.body);
  const data = await Presenter.findByIdAndUpdate(
    id,
    {
      name: String(req.body.name).trim(),
      title: String(req.body.title).trim(),
      image: String(req.body.image).trim(),
    },
    { new: true, runValidators: true },
  ).lean();

  if (!data) {
    throw new AppError("Presenter not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Presenter updated successfully",
    data,
  });
});

/** DELETE /api/presenters/:id */
const deletePresenter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);
  const data = await Presenter.findByIdAndDelete(id).lean();
  if (!data) {
    throw new AppError("Presenter not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Presenter deleted successfully",
    data,
  });
});

module.exports = {
  createPresenter,
  getPresenters,
  getPresenterById,
  updatePresenter,
  deletePresenter,
};
