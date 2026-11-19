
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {getMyProgress,recordProgress,getProgressSummary,} = require("../controllers/progressController");
router.get("/", protect, getMyProgress);
router.get("/summary", protect, getProgressSummary);
router.post("/record", protect, recordProgress);

module.exports = router;
