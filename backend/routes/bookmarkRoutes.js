
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {getMyBookmarks,addBookmark,removeBookmark,} = require("../controllers/bookmarkController");

router.get("/", protect, getMyBookmarks);
router.post("/:questionId", protect, addBookmark);
router.delete("/:questionId", protect, removeBookmark);

module.exports = router;
