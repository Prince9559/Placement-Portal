const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getCodingQuestions,
  getCodingQuestionById,
  createCodingQuestion,
  updateCodingQuestion,
  deleteCodingQuestion,
} = require("../controllers/codingController");

// Student routes
router.get("/", protect, getCodingQuestions);
router.get("/:id", protect, getCodingQuestionById);

// Admin routes
router.post("/", protect, adminOnly, createCodingQuestion);
router.put("/:id", protect, adminOnly, updateCodingQuestion);
router.delete("/:id", protect, adminOnly, deleteCodingQuestion);

module.exports = router;