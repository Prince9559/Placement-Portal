const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["aptitude", "reasoning", "verbal", "technical"],
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
    options: {
      type: [
        {
          text: {
            type: String,
            required: true,
            trim: true,
          },
          isCorrect: {
            type: Boolean,
            default: false,
          },
        },
      ],
      validate: {
        validator: function (options) {
          return (
            options.length >= 2 &&
            options.filter((option) => option.isCorrect).length === 1
          );
        },
        message: "At least 2 options and exactly 1 correct answer are required",
      },
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
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

module.exports = mongoose.model("Question", questionSchema);