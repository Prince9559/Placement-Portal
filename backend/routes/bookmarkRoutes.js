
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyBookmarks,
  addBookmark,
  removeBookmark,
} = require("../controllers/bookmarkController");

// Get logged-in student's bookmarks
router.get("/", protect, getMyBookmarks);

// Add question to bookmarks
router.post("/:questionId", protect, addBookmark);

// Remove question from bookmarks
router.delete("/:questionId", protect, removeBookmark);

module.exports = router;
