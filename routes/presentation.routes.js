const express = require("express");
const presentationController = require("../controllers/presentation.controller");

const router = express.Router();

router.post("/", presentationController.createPresentation);
router.get("/", presentationController.getPresentations);
router.get("/:id", presentationController.getPresentationById);
router.put("/:id", presentationController.updatePresentation);
router.delete("/:id", presentationController.deletePresentation);

module.exports = router;
