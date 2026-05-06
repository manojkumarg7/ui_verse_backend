const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Presentation = require("../models/presentation.model");

function isValidHttpUrl(value) {
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

function normalizeAttachmentLinks(body) {
  const { attachmentLinks } = body;
  if (attachmentLinks === undefined || attachmentLinks === null) {
    return [];
  }
  if (!Array.isArray(attachmentLinks)) {
    throw new AppError("attachmentLinks must be an array", 400);
  }
  return attachmentLinks.map((item, i) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new AppError(
        `attachmentLinks[${i}] must be a non-empty string`,
        400,
      );
    }
    return item.trim();
  });
}

function assertPresentationFields(body) {
  const {
    title,
    videoUrl,
    presenterName,
    category,
    date,
    thumbnail,
    description,
  } = body;
  const parts = [];

  if (title === undefined || title === null || !String(title).trim()) {
    parts.push("title is required");
  }
  if (videoUrl === undefined || videoUrl === null || !String(videoUrl).trim()) {
    parts.push("videoUrl is required");
  } else if (!isValidHttpUrl(videoUrl)) {
    parts.push("videoUrl must be a valid http or https URL");
  }
  if (
    presenterName === undefined ||
    presenterName === null ||
    !String(presenterName).trim()
  ) {
    parts.push("presenterName is required");
  }
  if (category === undefined || category === null || !String(category).trim()) {
    parts.push("category is required");
  }
  if (date === undefined || date === null || date === "") {
    parts.push("date is required");
  } else if (Number.isNaN(new Date(date).getTime())) {
    parts.push("date must be a valid date");
  }
  if (
    thumbnail === undefined ||
    thumbnail === null ||
    !String(thumbnail).trim()
  ) {
    parts.push("thumbnail is required");
  } else if (!isValidHttpUrl(thumbnail)) {
    parts.push("thumbnail must be a valid http or https URL");
  }
  if (
    description === undefined ||
    description === null ||
    !String(description).trim()
  ) {
    parts.push("description is required");
  }

  if (parts.length) {
    throw new AppError(parts.join("; "), 400);
  }
}

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid presentation id", 400);
  }
}

/** POST /api/presentations */
const createPresentation = asyncHandler(async (req, res) => {
  assertPresentationFields(req.body);
  const attachmentLinks = normalizeAttachmentLinks(req.body);

  const doc = await Presentation.create({
    title: String(req.body.title).trim(),
    videoUrl: String(req.body.videoUrl).trim(),
    presenterName: String(req.body.presenterName).trim(),
    category: String(req.body.category).trim(),
    date: new Date(req.body.date),
    thumbnail: String(req.body.thumbnail).trim(),
    description: String(req.body.description).trim(),
    attachmentLinks,
  });

  res.status(201).json({
    success: true,
    message: "Presentation created successfully",
    data: doc,
  });
});

/** GET /api/presentations */
const getPresentations = asyncHandler(async (_req, res) => {
  const data = await Presentation.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    message: "Presentations retrieved successfully",
    data,
  });
});

/** GET /api/presentations/:id */
const getPresentationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);
  const data = await Presentation.findById(id).lean();
  if (!data) {
    throw new AppError("Presentation not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Presentation retrieved successfully",
    data,
  });
});

/** PUT /api/presentations/:id */
const updatePresentation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);
  assertPresentationFields(req.body);
  const attachmentLinks = normalizeAttachmentLinks(req.body);

  const data = await Presentation.findByIdAndUpdate(
    id,
    {
      title: String(req.body.title).trim(),
      videoUrl: String(req.body.videoUrl).trim(),
      presenterName: String(req.body.presenterName).trim(),
      category: String(req.body.category).trim(),
      date: new Date(req.body.date),
      thumbnail: String(req.body.thumbnail).trim(),
      description: String(req.body.description).trim(),
      attachmentLinks,
    },
    { new: true, runValidators: true },
  ).lean();

  if (!data) {
    throw new AppError("Presentation not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Presentation updated successfully",
    data,
  });
});

/** DELETE /api/presentations/:id */
const deletePresentation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);
  const data = await Presentation.findByIdAndDelete(id).lean();
  if (!data) {
    throw new AppError("Presentation not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Presentation deleted successfully",
    data,
  });
});

module.exports = {
  createPresentation,
  getPresentations,
  getPresentationById,
  updatePresentation,
  deletePresentation,
};
