const mongoose = require("mongoose");

const codingQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Problem description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "arrays",
        "strings",
        "linked-list",
        "stack",
        "queue",
        "tree",
        "graph",
        "sorting",
        "searching",
        "dynamic-programming",
        "math",
        "other",
      ],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    constraints: {
      type: [String],
      default: [],
    },
    inputFormat: {
      type: String,
      default: "",
    },
    outputFormat: {
      type: String,
      default: "",
    },
    sampleTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          default: "",
        },
      },
    ],
    hiddenTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],
    hints: {
      type: [String],
      default: [],
    },
    companies: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    timeLimit: {
      type: Number,
      default: 1000,
    },
    memoryLimit: {
      type: Number,
      default: 256,
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
  "CodingQuestion",
  codingQuestionSchema
);