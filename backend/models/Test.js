const mongoose = require("mongoose");

const testQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options) =>
        Array.isArray(options) &&
        options.length >= 2 &&
        options.every((option) => typeof option === "string" && option.trim()),
      message: "At least 2 non-empty options are required",
    },
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["aptitude", "reasoning", "verbal", "technical", "mixed"],
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    passingMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    questions: {
      type: [testQuestionSchema],
      validate: {
        validator: (questions) =>
          Array.isArray(questions) && questions.length > 0,
        message: "At least one question is required",
      },
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);