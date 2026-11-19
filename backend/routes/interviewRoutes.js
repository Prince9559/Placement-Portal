const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {getInterviewQuestions,getInterviewQuestionById,getInterviewAnswer,createInterviewQuestion,updateInterviewQuestion,deleteInterviewQuestion,} = require("../controllers/interviewController");

router.get("/", protect, getInterviewQuestions);
router.get("/:id/answer", protect, getInterviewAnswer);
router.get("/:id", protect, getInterviewQuestionById);
router.post("/", protect, adminOnly, createInterviewQuestion);
router.put("/:id", protect, adminOnly, updateInterviewQuestion);
router.delete("/:id", protect, adminOnly, deleteInterviewQuestion);

module.exports = router;