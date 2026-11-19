const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {createTest,getTests,getTestById,updateTest,deleteTest,startTest,submitTest,getMyResults,getMyResultById,} = require("../controllers/testController");

router.get("/", protect, getTests);
router.get("/my-results", protect, getMyResults);
router.get("/my-results/:id", protect, getMyResultById);
router.get("/:id", protect, getTestById);
router.post("/:id/start", protect, startTest);
router.post("/attempts/:attemptId/submit", protect, submitTest);

 
router.post("/", protect, adminOnly, createTest);
router.put("/:id", protect, adminOnly, updateTest);
router.delete("/:id", protect, adminOnly, deleteTest);
module.exports = router;