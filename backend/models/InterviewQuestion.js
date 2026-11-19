const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["technical", "hr", "behavioral", "managerial"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    tips: {
      type: [String],
      default: [],
    },
    sampleAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    companies: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InterviewQuestion",
  interviewQuestionSchema
);