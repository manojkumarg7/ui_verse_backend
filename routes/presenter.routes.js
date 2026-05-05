const express = require("express");
const presenterController = require("../controllers/presenter.controller");

const router = express.Router();

router.post("/", presenterController.createPresenter);
router.get("/", presenterController.getPresenters);
router.get("/:id", presenterController.getPresenterById);
router.put("/:id", presenterController.updatePresenter);
router.delete("/:id", presenterController.deletePresenter);

module.exports = router;
