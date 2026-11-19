
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyProgress,
  recordProgress,
  getProgressSummary,
} = require("../controllers/progressController");

// Student's topic-wise progress
router.get("/", protect, getMyProgress);

// Overall progress summary
router.get("/summary", protect, getProgressSummary);

// Submit an answer and update progress
router.post("/record", protect, recordProgress);

module.exports = router;
