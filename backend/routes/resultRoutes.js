
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {getMyResults,getMyResultById,getAllResults,getResultById,getMyResultStats,} = require("../controllers/resultController");

router.get("/my-results", protect, getMyResults);
router.get("/my-results/:id", protect, getMyResultById);
router.get("/my-stats", protect, getMyResultStats);

router.get("/", protect, adminOnly, getAllResults);
router.get("/:id", protect, adminOnly, getResultById);

module.exports = router;
